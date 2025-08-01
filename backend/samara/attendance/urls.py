from django.urls import path
from .views import record_shift_attendance, get_shift_attendance

urlpatterns = [
    path('record-shift-attendance/', record_shift_attendance, name='record-shift-attendance'),
    path('get-shift-attendance/', get_shift_attendance, name='get-shift-attendance'),
]
