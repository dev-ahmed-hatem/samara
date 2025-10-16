from django.urls import path, include
from .views import ShiftAttendanceViewSet, SecurityGuardAttendanceViewSet, record_shift_attendance, \
    get_shift_attendance, get_project_attendances
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register('shift-attendances', ShiftAttendanceViewSet, basename="shift-attendance")
router.register('security-guard-attendances', SecurityGuardAttendanceViewSet, basename="security-guard-attendance")

urlpatterns = [
    path('', include(router.urls)),
    path('get-project-attendances/', get_project_attendances, name='get-project-attendances'),
    path('record-shift-attendance/', record_shift_attendance, name='record-shift-attendance'),
    path('get-shift-attendance/', get_shift_attendance, name='get-shift-attendance'),
]
