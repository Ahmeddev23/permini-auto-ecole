from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import Instructor


@admin.register(Instructor)
class InstructorAdmin(admin.ModelAdmin):
    """Administration des moniteurs"""

    list_display = ('full_name', 'driving_school', 'license_types', 'hire_date', 'is_active')
    list_filter = ('license_types', 'is_active', 'hire_date')
    search_fields = ('first_name', 'last_name', 'cin', 'email', 'phone')
    ordering = ('-hire_date',)

    fieldsets = (
        (_('Informations personnelles'), {
            'fields': ('user', 'driving_school', 'first_name', 'last_name', 'cin', 'photo')
        }),
        (_('Contact'), {
            'fields': ('phone', 'email')
        }),
        (_('Informations professionnelles'), {
            'fields': ('license_types', 'hire_date', 'salary')
        }),
        (_('Statut'), {
            'fields': ('is_active',)
        }),
    )

    readonly_fields = ('created_at', 'updated_at')

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'driving_school')
