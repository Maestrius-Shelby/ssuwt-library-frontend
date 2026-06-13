from django.urls import path
from ssuwt.views.search_views import search_scientific_materials
from ssuwt.views.search_views import main_search_scientific_materials


urlpatterns = [
    # Поиск
    path(
        'search-scientific-materials/',
        search_scientific_materials,
        name='search_scientific_materials'
    ),

    path(
        'main-search-scientific-materials/',
        main_search_scientific_materials,
        name='main_search_scientific_materials'
    ),
]
