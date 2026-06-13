import os
from pathlib import Path
from django.contrib.auth import get_user_model
from dotenv import load_dotenv

# Определяем базовую директорию
BASE_DIR = Path(__file__).resolve().parent.parent

import sys
sys.path.append(str(BASE_DIR))
# Загружаем переменные из .env
load_dotenv(os.path.join(BASE_DIR, '.env'))

# Указываем Django, какой settings-файл использовать
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stostatei.settings')

# Теперь можно импортировать Django и инициализировать его
import django
django.setup()

# Получаем модель пользователя
User = get_user_model()

# Читаем логин/пароль из переменных окружения
username = os.environ['DJANGO_SUPERUSER_USERNAME']
password = os.environ['DJANGO_SUPERUSER_PASSWORD']

# Создаем суперпользователя, если не существует
if not User.objects.filter(username=username).exists():
    print(f"Создание суперпользователя {username}...")
    User.objects.create_superuser(username=username, password=password)
else:
    print("Суперпользователь уже существует.")