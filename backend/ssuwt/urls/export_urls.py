from django.urls import path
from ssuwt.views.export_list_views import export_json


urlpatterns = [
    path("export-json/", export_json, name="export_json"),
]