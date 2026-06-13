from django.urls import path
from ssuwt.views.export_surname_views import export_json_surname


urlpatterns = [
    path("export-json-surname/", export_json_surname, name="export_json_surname"),
]