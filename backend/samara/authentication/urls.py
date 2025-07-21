from django.urls import path
from .views import CustomTokenObtainPairView, CustomTokenRefreshView, CustomTokenVerifyView, LogoutView, \
    get_authenticated_user
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView

urlpatterns = [
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('refresh/', TokenRefreshView.as_view(), name='refresh'),
    path('verify/', TokenVerifyView.as_view(), name='verify'),
    # path('logout/', LogoutView.as_view(), name='logout'),
    path('authenticated-user/', get_authenticated_user, name='authenticated_user'),
]
