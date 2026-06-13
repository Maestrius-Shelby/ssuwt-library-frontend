from django.http import FileResponse, JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from ssuwt.export.Form16_Depart import create_document
import os
import traceback
import logging


# Настройка логирования
logger = logging.getLogger(__name__)

@api_view(["POST"])
@permission_classes([AllowAny])
def export_json_department(request):
    try:
        # Получаем данные из запроса
        data = request.data.get("data")
        if not data:
            return JsonResponse({"error": "Нет данных для обработки"}, status=400)

        logger.info(f"Полученные данные: {data}")  # Логируем данные

        # Генерируем документ
        file_path = create_document(data)
        file_path = "ssuwt/export/export_results/Отчет_по_форме_16_Кафедра.docx"
        if not file_path:
            logger.error("Ошибка при создании документа")
            return JsonResponse({"error": "Ошибка при создании документа"}, status=500)

        logger.info(f"Файл создан по пути: {file_path}")  # Логируем путь к файлу

        # Проверяем существование файла
        if not os.path.exists(file_path):
            logger.error(f"Файл не найден после генерации: {file_path}")
            return JsonResponse({"error": "Файл не найден после генерации"}, status=500)

        # Отправляем файл пользователю
        response = FileResponse(open(file_path, "rb"), as_attachment=True, filename="Отчет_по_результатам_поиска.docx")
        return response

    except Exception as e:
        # Логируем исключение с трассировкой
        error_message = f"Ошибка: {str(e)}\n{traceback.format_exc()}"
        logger.error(error_message)  # Логируем ошибку в файл
        return JsonResponse({"error": error_message}, status=500)
