from django.urls import path
from ssuwt.views.parsing_views import start_parsing, get_parsing_lock_status


urlpatterns = [
    # Парсинг
    path('start-parsing/',
         start_parsing,
         name='start_parsing'),
    
    path('get-parsing-lock-status/',
         get_parsing_lock_status,
         name='get_parsing_lock_status'),
]