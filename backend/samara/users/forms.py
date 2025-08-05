from django.contrib.auth.admin import UserAdmin
from .models import User


class UserAdminForm(UserAdmin):
    model = User

    list_display = ('username', 'name', 'is_superuser')
    list_filter = ('username', 'name')
    fieldsets = [
        ("Personal Information", {'fields': ['name', 'role']}),
        ("Authentication", {'fields': ['username', 'password']}),
        ("Permissions", {'fields': ['is_active', 'is_moderator', 'is_superuser', 'is_root', 'user_permissions']}),
    ]
    add_fieldsets = [
        (None, {'fields': ['username', 'password1', 'password2', 'name', 'is_active',
                           'is_moderator', 'is_superuser']}),
    ]
