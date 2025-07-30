from rest_framework.routers import DefaultRouter
from .views import EmployeeViewSet, SecurityGuardViewSet, multiple_delete
from django.urls import path, include

router = DefaultRouter()
router.register('employees', EmployeeViewSet, basename='employee')
router.register('security-guard', SecurityGuardViewSet, basename='security-guard')

urlpatterns = [
    path('', include(router.urls)),
    path('multiple-delete/', multiple_delete, name="multiple-delete"),
]
