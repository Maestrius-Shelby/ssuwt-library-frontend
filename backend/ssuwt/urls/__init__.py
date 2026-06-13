from django.urls import path, include


urlpatterns = [
    path('', include('ssuwt.urls.auth_urls')),
    path('', include('ssuwt.urls.base_urls')),
    path('', include('ssuwt.urls.parsing_urls')),
    path('', include('ssuwt.urls.search_urls')),
    path('', include('ssuwt.urls.statistic_urls')),
    path('', include('ssuwt.urls.health_urls')),
    path('', include('ssuwt.urls.person_works_urls')),
    path('', include('ssuwt.urls.export_urls')),
    path('', include('ssuwt.urls.export_surname_urls')),
    path('', include('ssuwt.urls.export_department_urls')),
    path('', include('ssuwt.urls.verify_urls')),
    path('', include('ssuwt.urls.import_urls')),
]