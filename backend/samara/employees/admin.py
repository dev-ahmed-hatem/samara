from django.contrib import admin
from .models import Employee, SecurityGuard, SecurityGuardLocationShift


class SecurityGuardLocationShiftInline(admin.TabularInline):
    model = SecurityGuardLocationShift
    extra = 1


@admin.register(SecurityGuard)
class SecurityGuardAdmin(admin.ModelAdmin):
    search_fields = ['name', "employee_id"]
    inlines = [SecurityGuardLocationShiftInline]


admin.site.register(Employee)
