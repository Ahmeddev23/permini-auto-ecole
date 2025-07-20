from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import Student


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    """Administration des candidats"""

    list_display = ('full_name', 'driving_school', 'license_type', 'formation_status', 'registration_date', 'is_active')
    list_filter = ('license_type', 'formation_status', 'payment_type', 'is_active', 'registration_date')
    search_fields = ('first_name', 'last_name', 'cin', 'email', 'phone')
    ordering = ('-registration_date',)

    fieldsets = (
        (_('Informations personnelles'), {
            'fields': ('user', 'driving_school', 'first_name', 'last_name', 'cin', 'date_of_birth', 'photo')
        }),
        (_('Contact'), {
            'fields': ('phone', 'email', 'address')
        }),
        (_('Formation'), {
            'fields': ('license_type', 'formation_status', 'registration_date')
        }),
        (_('Paiement'), {
            'fields': ('payment_type', 'fixed_price', 'hourly_rate')
        }),
        (_('Progression'), {
            'fields': ('theory_hours_completed', 'practical_hours_completed', 'theory_exam_attempts', 'practical_exam_attempts')
        }),
        (_('Statut'), {
            'fields': ('is_active',)
        }),
    )

    readonly_fields = ('registration_date', 'created_at', 'updated_at')

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'driving_school')
