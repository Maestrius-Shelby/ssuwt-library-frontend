from django.urls import path
from ssuwt.views.auth_views import MyTokenObtainPairView, active_tokens, blacklisted_tokens, get_user
from rest_framework_simplejwt.views import (TokenRefreshView,)


urlpatterns = [

    path('token/',
         MyTokenObtainPairView.as_view(),
         name='token_obtain_pair'),

    path('token/refresh/',
         TokenRefreshView.as_view(),
         name='token_refresh'),
    
    path('get_user/',
         get_user),

    path('active-tokens/',
         active_tokens),

    path('blacklisted-tokens/',
         blacklisted_tokens),

]
