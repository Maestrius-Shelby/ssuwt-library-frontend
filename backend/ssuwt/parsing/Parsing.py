import time
import sys
import random
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.action_chains import ActionChains
from webdriver_manager.chrome import ChromeDriverManager


# Настройки для работы с Selenium
def setup_selenium():
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Запуск без графического интерфейса
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")  # скрыть автоматизацию

    # Автоматическая установка и управление драйвером
    service = Service(ChromeDriverManager().install())
    
    # Создание драйвера
    driver = webdriver.Chrome(service=service, options=chrome_options)
    return driver

def simulate_mouse_movements(driver, element, offset=5):
    actions = ActionChains(driver)
    if element:
        # Случайный промах перед наведением
        x_offset = random.randint(-offset, offset)
        y_offset = random.randint(-offset, offset)
        actions.move_to_element_with_offset(element, x_offset, y_offset)
        actions.pause(random.uniform(0.2, 0.5))
        actions.move_to_element(element)
        actions.pause(random.uniform(0.2, 0.4))
        actions.click()
        actions.perform()
        time.sleep(random.uniform(0.3, 0.6))
        
def simulate_random_mouse_movements(driver, area_selector='body', moves=3):
    try:
        area = driver.find_element(By.CSS_SELECTOR, area_selector)
        actions = ActionChains(driver)
        for _ in range(moves):
            x_offset = random.randint(-30, 30)
            y_offset = random.randint(-20, 20)
            actions.move_to_element_with_offset(area, x_offset, y_offset)
            actions.pause(random.uniform(0.2, 0.5))
        actions.perform()
    except Exception as e:
        print(f"Не удалось выполнить движения мыши: {e}")

# Функция для проверки на капчу
def is_captcha_page(driver):
    try:
        driver.find_element(By.CSS_SELECTOR, "div[class='g-recaptcha']")
        return True
    except:
        return False
    
# Функция для проверки на капчу
def is_blocked(driver):
    try:
        driver.find_element(By.ID, "blockedip")
        return True
    except:
        return False

# Функция для проверки блокировки и авторизации
def check_and_login(driver, login, password, url):
    driver.get(url)
    try:
        blocked_ip_element = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "blockedip"))
        )
        print("Окно блокировки найдено, выполняется переход на главную страницу...")
        main_page_link = blocked_ip_element.find_element(By.TAG_NAME, "a")
        main_page_link.click()

        print("Выполняется авторизация...")
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "login"))
        ).send_keys(login)
        driver.find_element(By.ID, "password").send_keys(password)
        driver.find_element(By.CSS_SELECTOR, "div[onclick='check_all()']").click()

        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "mainpage"))
        )  # Ждём загрузки главной страницы после авторизации
        print("Авторизация завершена.")
    except:
        print("Окно блокировки не найдено, продолжаем парсинг...")
        
# Функция для проверки блокировки и авторизации
def check_and_login_in_parsing(driver, login, password):
    time.sleep(3)

    try:
        print("Ищем окно блокировки...")
        blocked_ip_element = WebDriverWait(driver, 5).until(
            EC.presence_of_element_located((By.ID, "blockedip"))
        )
        print("Окно блокировки найдено. Пытаемся перезагрузить страницу...")

        driver.refresh()
        time.sleep(3)

        # Проверим, исчезло ли окно блокировки после перезагрузки
        if not is_blocked(driver):
            print("Окно блокировки исчезло после перезагрузки. Продолжаем без авторизации.")
            return

        print("Окно блокировки остаётся. Выполняется переход на главную и авторизация...")

        main_page_link = blocked_ip_element.find_element(By.TAG_NAME, "a")
        main_page_link.click()

        print("Выполняется авторизация...")
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "login"))
        ).send_keys(login)
        driver.find_element(By.ID, "password").send_keys(password)
        driver.find_element(By.CSS_SELECTOR, "div[onclick='check_all()']").click()

        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "mainpage"))
        )  # Ждём загрузки главной страницы после авторизации
        print("Авторизация завершена.")
    except:
        print("Окно блокировки не найдено, продолжаем парсинг...")


# Функция для подготовки параметров перед сбором
def setup_search_parameters(driver):
    print("Настройка параметров поиска...")    
    time.sleep(3)
    
    if is_captcha_page(driver):
        print("Капча на этапе подготовки параметров. Остановка парсинга.")
        return sys.exit()
    
    # Нажатие на выпадающий список организации
    org_dropdown = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "txt_orgs"))
    )
    simulate_mouse_movements(driver, org_dropdown)
    print("1. Была открыта вкладка организации")

    # Чекбокс организации
    org_checkbox = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "orgs_15156"))
    )
    simulate_mouse_movements(driver, org_checkbox)
    print("2. Нажали на чекбокс организации")

    # Выпадающий список категории публикаций
    cats_dropdown = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "txt_cats"))
    )
    simulate_mouse_movements(driver, cats_dropdown)
    print("3. Была открыта вкладка публикаций")

    # Чекбокс категории публикаций
    checkbox_element = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "cats_risc"))
    )
    bgcolor = checkbox_element.get_attribute("bgcolor")

    if bgcolor and bgcolor.lower() == "#dddddd":
        simulate_mouse_movements(driver, checkbox_element)
        print("4. Нажали на чекбокс категории публикаций")
    else:
        print("Цвет фона не #dddddd — действие пропущено.")

    # Кнопка "Поиск"
    search_button = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, '//div[@class="butred" and contains(text(), "Поиск")]'))
    )
    simulate_mouse_movements(driver, search_button)

    # Выпадающий список ролей
    roles_dropdown = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "txt_roles"))
    )
    simulate_mouse_movements(driver, roles_dropdown)
    print("Нажали на выпадающий список ролей")

    # Чекбокс "Автор"
    role_checkbox1 = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "roles_100"))
    )
    simulate_mouse_movements(driver, role_checkbox1)
    print("Нажали на чекбокс Автора")

    try:
        # Чекбокс "Науч рук"
        role_checkbox2 = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "roles_26"))
        )
        simulate_mouse_movements(driver, role_checkbox2)
        print("Нажали на чекбокс научного руководителя")
    except:
        print("Чекбокс с ID 'roles_26' не найден.")

    # Повторный клик "Поиск"
    final_search = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, ".butred[onclick='pub_search()']"))
    )
    simulate_mouse_movements(driver, final_search)
    print("Настройка завершена.")


# Функция для парсинга ссылок на страницы с работами
def parse_page(driver):
    if is_captcha_page(driver):
        print("Капча на этапе сбора ссылок на страницы. Остановка парсинга.")
        return sys.exit()

    works = []
    rows = driver.find_elements(By.CSS_SELECTOR, 'tr[id^="arw"]')
    print("Собираю ссылки на работы со страницы поиска")
    for row in rows:
        try:
            link_element = row.find_element(By.CSS_SELECTOR, 'a[href^="/item.asp"]')
            link = link_element.get_attribute('href')
            works.append({'link': link, 'element': link_element})  # <--- Сохраняем элемент
        except:
            continue
    
    return works

# Функция для перехода на следующую страницу
def go_to_page(driver, page_number):
    script = f"javascript:goto_page({page_number})"
    driver.execute_script(script)
    time.sleep(random.uniform(2.3, 3.6))

# Функция для определения количества страниц
def get_last_page_number(driver):
    pagination_elements = driver.find_elements(By.CSS_SELECTOR, 'a[href^="javascript:goto_page"]')
    
    page_numbers = []
    for element in pagination_elements:
        try:
            page_numbers.append(int(element.text))
        except ValueError:
            continue
    
    return max(page_numbers) if page_numbers else 1

# Функция для парсинга всех страниц с работами
def parse_elibrary_page(driver, url):
    driver.get(url)
    time.sleep(5)

    if is_captcha_page(driver):
        print("Капча на этапе сбора ссылок на страницы №2. Остановка парсинга.")
        sys.exit()

    setup_search_parameters(driver)  # Выполнение предварительных настроек поиска
    
    all_works = []
    page_works = parse_page(driver)
    if page_works is None:
        return []  
    all_works.extend(page_works)
    
    last_page_number = get_last_page_number(driver)

    for page_number in range(2, last_page_number + 1):
        go_to_page(driver, page_number)
        
        if is_captcha_page(driver):
            print("Капча на этапе сбора ссылок на страницы №3. Остановка парсинга.")
            break

        page_works = parse_page(driver)
        if page_works is None:
            break

        all_works.extend(page_works)
    
    return all_works

# Функция для парсинга информации со страницы каждой работы
def parse_work_page(driver):
        
        # 🎯 Имитируем случайные движения мыши по области страницы
        simulate_random_mouse_movements(driver)
        if is_captcha_page(driver):
            print("Капча на этапе парсинга работы. Остановка парсинга.")
            return None

        try:
            title_element = driver.find_element(By.CSS_SELECTOR, 'p[class="bigtext"]')
            title = title_element.text
        except:
            title = "Заголовок не найден"
        
        try:
            authors_div = driver.find_elements(By.CSS_SELECTOR, 'div[style*="display: inline-block; white-space: nowrap"] b font[color="#00008f"]')
            authors_span = driver.find_elements(By.CSS_SELECTOR, 'span.help.pointer b font[color="#00008f"]')
            authors_raw = set([author.text.replace('\xa0', ' ') for author in authors_div + authors_span])
            authors = [{"fio": author, "relationship_type": 1} for author in authors_raw]
        except:
            authors = []

        try:
            supervisor_element = driver.find_element(By.XPATH, "//td[contains(., 'Научный руководитель: ')]/div[2]/span/font")
            supervisor = supervisor_element.text.replace('\xa0', ' ')
            if supervisor:  # Если руководитель найден, добавляем в authors
                authors.append({"fio": supervisor, "relationship_type": 2})
        except:
            pass  # Если руководитель не найден, ничего не делаем
        
        try:
            # Поиск страниц первым способом
            pages_element = driver.find_element(By.XPATH, "//td//div[contains(., 'Страницы')]/font[@color='#00008f']")
            pages = pages_element.text
            try:
                # Поиск года первым способом
                year_element = driver.find_element(By.XPATH, "//td[contains(., 'Год')]/font[@color='#00008f']")
                year = year_element.text
            except:
                year = "Год не найден"
        except:
            try:
                # Поиск страниц вторым способом
                pages_element = driver.find_element(By.XPATH, "//td[contains(., 'Страницы')]/font[@color='#00008f']")
                pages = pages_element.text
            except:
                pages = "Страницы не найдены"
            
            try:
                # Поиск года вторым способом
                year_element = driver.find_element(By.XPATH, "(//td[contains(., 'Год издания')]/font[@color='#00008f'])[3]")
                year = year_element.text
            except:
                year = "Год не найден"

                
        try:
            rubric_element = driver.find_element(By.CSS_SELECTOR, 'span[id="rubric_oecd"]')
            rubric = rubric_element.text.replace('\xa0', ' ')
        except:
            rubric = "Рубрика не найдена"
        
        try:
            rating_element = driver.find_element(By.XPATH, "//td[contains(., 'Входит в РИНЦ:')]/font")
            rating_text = rating_element.text.strip().lower().replace('\xa0', ' ')
            if rating_text == "да":
                rating = 2
            elif rating_text == "нет":
                rating = 4
            else:
                rating = None  # Если текст неизвестный, оставляем значение пустым
        except:
            rating = None  # Если элемент не найден, также оставляем значение пустым
        
        try:
            source_element = driver.find_element(By.XPATH, "//font[contains(text(), 'ЖУРНАЛ') or contains(text(), 'ИСТОЧНИК') or contains(text(), 'КОНФЕРЕНЦИЯ')]")
            source_title_element = source_element.find_element(By.XPATH, "./following::a[1]")
            source_title = source_title_element.text
            source = source_title
        except:
            source = "Источник не найден"
            
        return {
            'title': title,
            'authors': authors,
            'publication_year': year,
            'count_of_pages': pages,
            'theme': rubric,
            'rating': rating,
            'journal_publisher': source,
            'publication_type': 1,
            'institute_id': None,
            'department_id': None
        }