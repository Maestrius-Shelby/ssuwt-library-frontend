import subprocess
import json
import re
import os
import random
import time
from rest_framework.response import Response
from ssuwt.models import ScientificMaterials, Human
from rest_framework.decorators import api_view
from .roles_views import check_user_role
from rest_framework import status
from ssuwt.models import ParsingLock
from ssuwt.parsing.Parsing import parse_elibrary_page, parse_work_page, setup_selenium, check_and_login, is_captcha_page, check_and_login_in_parsing
from pathlib import Path
from dotenv import load_dotenv
from django.db.models import F, Value
from django.db.models.functions import Lower, Replace
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(os.path.join(BASE_DIR, '.env'))

def normalize_fio(fio_str):
    return fio_str.replace('.', '').replace(' ', '').lower()

def parse_fio(fio_str):
    """
    Возвращает кортеж (last_name, first_name, middle_name)
    из строки:
    - 'Фамилия И.О.'
    - 'Фамилия Имя Отчество'
    - 'И.О. Фамилия'
    """
    parts = fio_str.strip().split()
    last_name = None
    first_name = None
    middle_name = None

    if len(parts) == 2:
        # Может быть либо 'Фамилия И.О.' либо 'И.О. Фамилия'
        if '.' in parts[0]:  # 'И.О. Фамилия'
            initials = parts[0].replace('.', '')
            last_name = parts[1]
        else:  # 'Фамилия И.О.'
            initials = parts[1].replace('.', '')
            last_name = parts[0]

        if len(initials) >= 1:
            first_name = initials[0]
        if len(initials) >= 2:
            middle_name = initials[1]

    elif len(parts) == 3:
        # 'Фамилия Имя Отчество'
        last_name = parts[0]
        first_name = parts[1]
        middle_name = parts[2]

    return last_name, first_name, middle_name

@api_view(['POST'])
def start_parsing(request):
    # Проверка блокировки
    if ParsingLock.is_parsing_locked():
        return Response({'detail': 'Парсинг временно недоступен. Повторите попытку позже.'}, status=429)

    # Проверка роли
    if not check_user_role(request, allowed_roles=['Заведующие кафедрой', 'Преподаватели']):
        return Response({"detail": "Недостаточно прав для доступа к данным."}, status=403)

    EXISTING_IDS = {
            int(re.search(r'id=(\d+)', link).group(1))
            for link in ScientificMaterials.objects.filter(link__isnull=False).values_list('link', flat=True)
            if re.search(r'id=(\d+)', link)
        }
    
    try:
        # Установить блокировку сразу, чтобы избежать параллельных запусков
        ParsingLock.lock_parsing(duration_hours=6)
        # Получаем URL из тела POST-запроса
        url = request.data.get('url')
        login = os.getenv('ELIBRARY_LOGIN')
        password = os.getenv('ELIBRARY_PASSWORD')
        if not url:
            return Response({'error': 'URL не был передан'}, status=400)
        # Подключаем WebDriver
        driver = setup_selenium()  # Используйте ваш драйвер
        check_and_login(driver, login, password, url)
        # Получаем все ID статей из базы ОДИН РАЗ перед парсингом
        
        # Парсим страницы
        works_links = parse_elibrary_page(driver, url)
        
        # Перебор работ и их парсинг
        all_works_info = []
        filtered_links = []

        for work in works_links:
            if len(filtered_links) >= 80:
                print("Достигнут лимит в 80 новых работ. Остановлено добавление.")
                break

            link = work['link']
            match = re.search(r'id=(\d+)', link)
            if match:
                link_id = int(match.group(1))
                if link_id in EXISTING_IDS:
                    print(f"Работа {link_id} уже существует!")
                    continue
                else:
                    print(f"Работа {link_id} добавлена!")
                    filtered_links.append(work)
                    
        # Функция для перехода на следующую страницу
        script = f"javascript:goto_page(1)"
        driver.execute_script(script)
        time.sleep(2)  # Даем странице загрузиться
        # --- Открытие и обработка по 10 вкладок ---
        main_window = driver.current_window_handle
        i = 0
        current_page = 1
        
        while i < len(filtered_links):
            batch_size = random.randint(3, 10)
            batch = filtered_links[i:i + batch_size]

            found_any = False

            for work in batch:
                link = work.get('link')
                if not link:
                    continue

                relative_href = link.split("elibrary.ru")[-1]  # /item.asp?id=...

                try:
                    # Ждём, пока элемент станет кликабельным
                    element = WebDriverWait(driver, 5).until(
                        EC.element_to_be_clickable((By.CSS_SELECTOR, f'a[href="{relative_href}"]'))
                    )

                    # Кликаем с Ctrl (открытие в новой вкладке)
                    ActionChains(driver)\
                        .key_down(Keys.CONTROL)\
                        .click(element)\
                        .key_up(Keys.CONTROL)\
                        .perform()

                    time.sleep(0.3)
                    found_any = True

                except Exception as e:
                    print(f"[!] Не удалось найти или кликнуть по элементу для ссылки {link}: {e}")
                    continue

            if not found_any:
                # Ни одного элемента не нашли — переходим на следующую страницу
                current_page += 1
                script = f"javascript:goto_page({current_page})"
                print(f"Переход на страницу {current_page} поиска, так как элементы не найдены.")
                driver.execute_script(script)
                time.sleep(2)
                if is_captcha_page(driver):
                    print("Капча. Остановка парсинга.")
                    break
                check_and_login_in_parsing(driver, login, password)
                continue

            time.sleep(2)  # Ждём, чтобы вкладки открылись

            handles = driver.window_handles
            for handle in handles:
                if handle == main_window:
                    continue
                driver.switch_to.window(handle)
                time.sleep(1)
                
                check_and_login_in_parsing(driver, login, password)
                work_info = parse_work_page(driver)
                if work_info is None:
                    break  # капча или ошибка

                work_info['link'] = driver.current_url
                all_works_info.append(work_info)

                driver.close()

            driver.switch_to.window(main_window)
            i += batch_size
        
        # Закрываем драйвер после завершения парсинга
        driver.quit()
        # Извлекаем все уникальные ФИО авторов
        authors = {author["fio"]
                   for item in all_works_info for author in item["authors"]}
        # Словарь для хранения соответствия ФИО и id авторов
        authors_dict = {}
        # Обрабатываем каждое ФИО
        for fio in authors:
            # Нормализуем ввод
            normalized_input = normalize_fio(fio)

            # Ищем автора в базе данных с учетом регистра и точек
            author = Human.objects.annotate(
                normalized_fio=Lower(
                    Replace(
                        Replace(F('fio'), Value('.'), Value('')),
                        Value(' '), Value('')
                    )
                )
            ).filter(normalized_fio=normalized_input).first()
            
            # Если автор не найден, создаем нового
            if not author:
                last_name, first_name, middle_name = parse_fio(fio)
                author = Human.objects.create(
                    fio=fio,
                    last_name=last_name,
                    first_name=first_name,
                    middle_name=middle_name,
                    birth_date=None,
                    department=None,
                    job_title=None,
                )
            # Сохраняем id автора в словаре
            authors_dict[fio] = author.id
        # Обновляем исходный JSON, добавляя id авторов
        for item in all_works_info:
            for author in item["authors"]:
                fio = author["fio"]
                author["human"] = authors_dict[fio]  # Добавляем id автора
        # Сохранение результатов в JSON-файл
        #save_to_json(all_works_info, "parsed_works.json")
        print(all_works_info)
        # Возврат результата для использования в React или других приложениях
        return Response(all_works_info, status=status.HTTP_200_OK)

    except Exception as e:
        # При ошибке снять блокировку
        lock = ParsingLock.objects.first()
        if lock:
            lock.is_locked = False
            lock.unlocked_at = None
            lock.save()
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except subprocess.CalledProcessError as e:
        return Response({'error': f'Ошибка выполнения парсинга: {str(e)}', 'stderr': e.stderr}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except json.JSONDecodeError:
        return Response({'error': 'Невалидный JSON в теле запроса'}, status=status.HTTP_400_BAD_REQUEST)
    except FileNotFoundError:
        return Response({'error': 'Файл не найден'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except json.JSONDecodeError as json_err:
        return Response({'error': f'Ошибка чтения JSON из файла: {str(json_err)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        # Общий случай для не перехваченных ошибок
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

import datetime

def format_remaining_time(seconds):
    return str(datetime.timedelta(seconds=seconds))

@api_view(['GET'])
def get_parsing_lock_status(request):
    # Первичная проверка и авторазблокировка, если нужно
    is_locked = ParsingLock.is_parsing_locked()

    # Загружаем актуальный объект после возможного изменения
    lock = ParsingLock.objects.first()

    if not is_locked or not lock:
        return Response({
            'is_locked': False,
            'remaining_time_seconds': 0,
            'remaining_time_formatted': "0:00:00",
            'started_at': None,
            'unlocked_at': None
        })

    remaining_seconds = lock.remaining_time_seconds
    return Response({
        'is_locked': True,
        'started_at': lock.started_at,
        'unlocked_at': lock.unlocked_at,
        'remaining_time_seconds': remaining_seconds,
        'remaining_time_formatted': lock.remaining_time_formatted
    })
