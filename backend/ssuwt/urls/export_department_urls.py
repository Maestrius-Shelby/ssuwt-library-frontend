from django.urls import path
from ssuwt.views.export_department_views import export_json_department


urlpatterns = [
    path("export-json-department/", export_json_department, name="export_json_department"),
]