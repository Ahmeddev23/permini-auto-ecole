from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Administration des utilisateurs"""

    list_display = ('username', 'email', 'user_type', 'is_verified', 'is_active', 'date_joined')
    list_filter = ('user_type', 'is_verified', 'is_active', 'is_staff', 'date_joined')
    search_fields = ('username', 'email', 'first_name', 'last_name', 'cin')
    ordering = ('-date_joined',)

    fieldsets = BaseUserAdmin.fieldsets + (
        (_('Informations supplémentaires'), {
            'fields': ('user_type', 'phone', 'cin', 'photo', 'is_verified', 'verification_code')
        }),
    )

    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        (_('Informations supplémentaires'), {
            'fields': ('user_type', 'phone', 'cin', 'photo')
        }),
    )

    readonly_fields = ('date_joined', 'last_login')

    def get_queryset(self, request):
        return super().get_queryset(request).select_related()
