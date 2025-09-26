from rest_framework.routers import DefaultRouter
from .views import EmployeeViewSet, SecurityGuardViewSet, LocationShiftViewSet, SupervisorMonthlyRecord, \
    SupervisorDailyRecord, multiple_delete, get_home_stats, get_moderator_home_stats
from django.urls import path, include

router = DefaultRouter()
router.register('employees', EmployeeViewSet, basename='employee')
router.register('security-guards', SecurityGuardViewSet, basename='security-guard')
router.register('location-shifts', LocationShiftViewSet, basename='location-shift')

urlpatterns = [
    path('', include(router.urls)),
    path('get-home-stats/', get_home_stats, name="get-home-stats"),
    path('get-moderator-home-stats/', get_moderator_home_stats, name="moderator-home-stats"),
    path('supervisor-monthly-records/', SupervisorMonthlyRecord.as_view(), name="supervisor-monthly-records"),
    path('supervisor-daily-records/', SupervisorDailyRecord.as_view(), name="supervisor-daily-records"),
    path('multiple-delete/', multiple_delete, name="multiple-delete"),
]
