from django.contrib.auth.admin import UserAdmin
from .models import User


class UserAdminForm(UserAdmin):
    model = User

    list_display = ('username', 'is_superuser')
    list_filter = ('username',)
    fieldsets = [
        ("Personal Information", {'fields': ['role']}),
        ("Authentication", {'fields': ['username', 'password']}),
        ("Permissions", {'fields': ['is_active', 'is_moderator', 'is_superuser', 'is_root', 'user_permissions']}),
    ]
    add_fieldsets = [
        (None, {'fields': ['username', 'password1', 'password2', 'is_active',
                           'is_moderator', 'is_superuser']}),
    ]
