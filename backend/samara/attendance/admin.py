from django.contrib import admin
from .models import ShiftAttendance, SecurityGuardAttendance

admin.site.register(ShiftAttendance)
admin.site.register(SecurityGuardAttendance)
