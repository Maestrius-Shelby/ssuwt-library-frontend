import re
from docx import Document

def extract_year(text):
    """Извлекает год из строки в диапазоне 1970–2050."""
    match = re.search(r'\b(19[7-9]\d|20[0-4]\d|2050)\b', text)
    return int(match.group()) if match else None

def parse_docx_to_json(file):
    """
    Парсит docx-файл (InMemoryUploadedFile или TemporaryUploadedFile) и возвращает JSON.
    """
    doc = Document(file)
    data = []
    in_scientific_section = False

    for table in doc.tables:
        rows = table.rows[2:-1]  # Пропускаем заголовок таблицы

        for i, row in enumerate(rows):
            cells = [cell.text.strip() for cell in row.cells]

            if len(cells) < 6:
                continue

            # Проверка на заголовки секций
            if cells[1] in ["а) учебные издания", "б) научные труды", "в) патенты на изобретения, авторские свидетельства, сертификаты"]:
                if cells[1] == "а) учебные издания":
                    in_scientific_section = True
                    publication_type = 4
                if cells[1] == "б) научные труды":
                    in_scientific_section = True
                    publication_type = 1
                if cells[1] == "в) патенты на изобретения, авторские свидетельства, сертификаты":
                    in_scientific_section = True
                    publication_type = 6
                continue

            title = cells[1]
            journal_publisher = cells[3]
            publication_year = extract_year(journal_publisher)

            # Определение столбца количества страниц
            count_of_pages = cells[5] if in_scientific_section else cells[4]

            # Обработка авторов
            authors_text = cells[6].strip()
            authors = []
            if authors_text.lower() != "без соавторов":
                authors = [
                    {"fio": author.strip(), "relationship_type": 1}
                    for author in re.split(r",|\n", authors_text)
                    if author.strip()
                ]

            # Добавление основного автора
            authors.append({"fio": "Моторин С.В.", "relationship_type": 1})

            data.append({
                "title": title,
                "authors": authors,
                "theme": None,
                "journal_publisher": journal_publisher,
                "publication_year": publication_year,
                "count_of_pages": count_of_pages,
                "publication_type": publication_type,
                "rating": None,
                "department": None
            })

    return data


# Обработка файла и сохранение в JSON
# file_path = "Список_тр. профессора Моторина.docx"
# parsed_data = parse_docx_to_json(file_path)

# json_output_path = "Import_output.json"
# with open(json_output_path, "w", encoding="utf-8") as json_file:
#     json.dump(parsed_data, json_file, ensure_ascii=False, indent=4)

# print(f"JSON-файл сохранен: {json_output_path}")
