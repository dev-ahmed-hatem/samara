from rest_framework.routers import DefaultRouter
from .views import EmployeeViewSet, SecurityGuardViewSet, multiple_delete, get_home_stats
from django.urls import path, include

router = DefaultRouter()
router.register('employees', EmployeeViewSet, basename='employee')
router.register('security-guards', SecurityGuardViewSet, basename='security-guard')

urlpatterns = [
    path('', include(router.urls)),
    path('get-home-stats/', get_home_stats, name="get-home-stats"),
    path('multiple-delete/', multiple_delete, name="multiple-delete"),
]
