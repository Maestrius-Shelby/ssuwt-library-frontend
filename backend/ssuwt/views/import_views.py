from rest_framework.response import Response
from ssuwt.models import Human
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import api_view, parser_classes
from rest_framework import status
from ssuwt.Import.Import import parse_docx_to_json
from django.db.models import F, Value
from django.db.models.functions import Lower, Replace


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

@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def import_form16(request):
    if "file" not in request.FILES:
        return Response({"error": "Файл не был передан."}, status=status.HTTP_400_BAD_REQUEST)

    file = request.FILES["file"]

    try:
        all_works_info = parse_docx_to_json(file)
        # Сохранение результатов в JSON-файл
        print(all_works_info)
        # Извлекаем все уникальные ФИО авторов
        authors = {author["fio"]
            for item in all_works_info for author in item["authors"]}
        print(authors)
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
        
        
        # Возврат результата для использования в React или других приложениях
        return Response(all_works_info, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": f"Ошибка при обработке файла: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
 