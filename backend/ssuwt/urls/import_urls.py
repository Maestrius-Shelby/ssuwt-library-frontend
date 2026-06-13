from django.urls import path
from ssuwt.views.import_views import import_form16


urlpatterns = [
    path('import-form16/', import_form16, name="import_form16"),
]
