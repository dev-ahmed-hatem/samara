from django.urls import path
from .views import record_shift_attendance, get_shift_attendance, get_project_attendances

urlpatterns = [
    path('get-project-attendances/', get_project_attendances, name='get-project-attendances'),
    path('record-shift-attendance/', record_shift_attendance, name='record-shift-attendance'),
    path('get-shift-attendance/', get_shift_attendance, name='get-shift-attendance'),
]
