from django.urls import path
from ssuwt.views.person_works_views import scientific_materias_for_person


urlpatterns = [
    # Парсинг
    path('scientific-materias-for-person/',
         scientific_materias_for_person,
         name='scientific_materias_for_person'),
]
