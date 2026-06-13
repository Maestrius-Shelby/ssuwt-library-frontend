import multiprocessing

# Адрес и порт, на которых будет запущен Gunicorn
bind = "0.0.0.0:8000"

# Количество воркеров: 2 * CPU + 1 (по рекомендации Gunicorn)
workers = multiprocessing.cpu_count() * 2 + 1

# Количество потоков на один воркер (для обработки нескольких запросов в одном процессе)
threads = 2

# Максимальное время ожидания запроса (секунды)
timeout = 60

# Уровень логирования (можно сменить на "debug" при отладке)
loglevel = "info"

# Лог запросов (stdout, чтобы видеть в docker logs)
accesslog = "-"

# Лог ошибок (stdout)
errorlog = "-"

# Имя процесса (по желанию, удобно для мониторинга)
proc_name = "ssuwt_library"

# Принудительное завершение воркера при утечках памяти (опционально)
max_requests = 1000
max_requests_jitter = 100
