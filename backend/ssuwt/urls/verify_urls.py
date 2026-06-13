from django.urls import path
from ssuwt.views.verify_views import verify_work


urlpatterns = [
    path("verification-of-work/", verify_work, name="verify_work"),
]
