from django.urls import path
from ssuwt.views.statistic_views import statistic, scientific_materials_statistics


urlpatterns = [
    # Статистика
    path('statistic/',
         statistic,
         name='statistic'),
    
    path('scientific-materials-statistics/',
         scientific_materials_statistics,
         name='scientific_materials_statistics'),
]
