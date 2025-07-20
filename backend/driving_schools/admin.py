from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from .models import DrivingSchool, Expense, Revenue, UpgradeRequest, PaymentProof


@admin.register(DrivingSchool)
class DrivingSchoolAdmin(admin.ModelAdmin):
    """Administration des auto-écoles"""

    list_display = ('name', 'manager_name', 'status', 'current_plan', 'current_accounts', 'max_accounts', 'days_remaining')
    list_filter = ('status', 'current_plan', 'created_at')
    search_fields = ('name', 'manager_name', 'email', 'phone')
    ordering = ('-created_at',)

    fieldsets = (
        (_('Informations de base'), {
            'fields': ('owner', 'name', 'logo', 'manager_name', 'manager_photo')
        }),
        (_('Contact'), {
            'fields': ('address', 'phone', 'email')
        }),
        (_('Documents'), {
            'fields': ('cin_document', 'legal_documents')
        }),
        (_('Plan et statut'), {
            'fields': ('status', 'current_plan', 'plan_start_date', 'plan_end_date', 'max_accounts', 'renewal_count', 'current_accounts')
        }),
        (_('Personnalisation'), {
            'fields': ('theme_color', 'dark_mode')
        }),
    )

    readonly_fields = ('created_at', 'updated_at')

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('owner')


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    """Administration des dépenses"""

    list_display = ('driving_school', 'category', 'description', 'amount', 'date', 'supplier')
    list_filter = ('category', 'date', 'is_recurring')
    search_fields = ('description', 'supplier', 'reference_number')
    ordering = ('-date',)

    fieldsets = (
        (_('Informations de base'), {
            'fields': ('driving_school', 'category', 'description', 'amount', 'date')
        }),
        (_('Détails'), {
            'fields': ('supplier', 'reference_number', 'receipt', 'is_recurring')
        }),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('driving_school')


@admin.register(Revenue)
class RevenueAdmin(admin.ModelAdmin):
    """Administration des revenus"""

    list_display = ('driving_school', 'source', 'description', 'amount', 'date', 'student')
    list_filter = ('source', 'date')
    search_fields = ('description', 'reference_number')
    ordering = ('-date',)

    fieldsets = (
        (_('Informations de base'), {
            'fields': ('driving_school', 'student', 'source', 'description', 'amount', 'date')
        }),
        (_('Détails'), {
            'fields': ('reference_number',)
        }),
    )


@admin.register(UpgradeRequest)
class UpgradeRequestAdmin(admin.ModelAdmin):
    """Administration des demandes de mise à niveau"""

    list_display = ('driving_school', 'current_plan', 'requested_plan', 'amount', 'status', 'is_renewal', 'created_at')
    list_filter = ('status', 'current_plan', 'requested_plan', 'is_renewal', 'payment_method', 'created_at')
    search_fields = ('driving_school__name',)
    ordering = ('-created_at',)
    readonly_fields = ('id', 'created_at')

    fieldsets = (
        (_('Informations de base'), {
            'fields': ('id', 'driving_school', 'current_plan', 'requested_plan', 'is_renewal')
        }),
        (_('Paiement'), {
            'fields': ('payment_method', 'amount')
        }),
        (_('Statut'), {
            'fields': ('status', 'created_at', 'processed_at', 'processed_by')
        }),
        (_('Notes'), {
            'fields': ('admin_notes',)
        }),
    )

    actions = ['approve_requests', 'reject_requests', 'cancel_requests']

    def approve_requests(self, request, queryset):
        """Approuver les demandes sélectionnées"""
        from django.utils import timezone

        approved_count = 0
        for upgrade_request in queryset.filter(status='pending'):
            # Logique d'approbation ici
            upgrade_request.status = 'approved'
            upgrade_request.processed_at = timezone.now()
            upgrade_request.processed_by = request.user
            upgrade_request.save()

            # Mettre à jour le plan de l'auto-école
            driving_school = upgrade_request.driving_school
            if upgrade_request.is_renewal:
                # Renouvellement
                if driving_school.current_plan == 'standard':
                    driving_school.renewal_count += 1
                    driving_school.max_accounts = 200 + (driving_school.renewal_count * 50)
                driving_school.plan_end_date = driving_school.plan_end_date + timezone.timedelta(days=30)
            else:
                # Mise à niveau
                driving_school.current_plan = upgrade_request.requested_plan
                driving_school.plan_start_date = timezone.now()
                driving_school.plan_end_date = driving_school.plan_start_date + timezone.timedelta(days=30)
                if upgrade_request.requested_plan == 'standard':
                    driving_school.max_accounts = 200
                    driving_school.renewal_count = 0
                elif upgrade_request.requested_plan == 'premium':
                    driving_school.max_accounts = 999999
                    driving_school.renewal_count = 0

            driving_school.save()
            approved_count += 1

        self.message_user(request, f'{approved_count} demande(s) approuvée(s).')

    approve_requests.short_description = "Approuver les demandes sélectionnées"

    def reject_requests(self, request, queryset):
        """Rejeter les demandes sélectionnées"""
        from django.utils import timezone

        rejected_count = 0
        for upgrade_request in queryset.filter(status='pending'):
            upgrade_request.status = 'rejected'
            upgrade_request.processed_at = timezone.now()
            upgrade_request.processed_by = request.user
            upgrade_request.save()
            rejected_count += 1

        self.message_user(request, f'{rejected_count} demande(s) rejetée(s).')

    reject_requests.short_description = "Rejeter les demandes sélectionnées"

    def cancel_requests(self, request, queryset):
        """Annuler les demandes sélectionnées"""
        from django.utils import timezone

        cancelled_count = 0
        for upgrade_request in queryset.filter(status='pending'):
            upgrade_request.status = 'cancelled'
            upgrade_request.processed_at = timezone.now()
            upgrade_request.processed_by = request.user
            upgrade_request.admin_notes = 'Annulé manuellement par l\'administrateur'
            upgrade_request.save()
            cancelled_count += 1

        self.message_user(request, f'{cancelled_count} demande(s) annulée(s).')

    cancel_requests.short_description = "Annuler les demandes sélectionnées"


@admin.register(PaymentProof)
class PaymentProofAdmin(admin.ModelAdmin):
    """Administration des justificatifs de paiement"""

    list_display = ('upgrade_request', 'transfer_reference', 'transfer_date', 'uploaded_at')
    list_filter = ('transfer_date', 'uploaded_at')
    search_fields = ('upgrade_request__driving_school__name', 'transfer_reference')
    ordering = ('-uploaded_at',)
    readonly_fields = ('uploaded_at',)

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('upgrade_request', 'upgrade_request__driving_school')
