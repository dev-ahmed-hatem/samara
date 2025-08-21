from django.contrib import admin
from .models import Employee, SecurityGuard


@admin.register(SecurityGuard)
class SecurityGuardAdmin(admin.ModelAdmin):
    search_fields = ['name', "employee_id"]


admin.site.register(Employee)
