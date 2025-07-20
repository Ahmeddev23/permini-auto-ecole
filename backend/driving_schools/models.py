from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from datetime import timedelta
import uuid
import json





class DrivingSchool(models.Model):
    """
    Modèle pour les auto-écoles
    """
    PLAN_CHOICES = (
        ('standard', _('Standard (30 jours gratuits)')),
        ('premium', _('Premium')),
    )

    STATUS_CHOICES = (
        ('pending', _('En attente')),
        ('approved', _('Approuvé')),
        ('rejected', _('Rejeté')),
        ('suspended', _('Suspendu')),
    )

    # Informations de base
    owner = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='driving_school',
        verbose_name=_('Propriétaire')
    )

    name = models.CharField(
        max_length=200,
        verbose_name=_('Nom de l\'auto-école')
    )

    logo = models.ImageField(
        upload_to='driving_schools/logos/',
        blank=True,
        null=True,
        verbose_name=_('Logo')
    )

    # Informations du responsable
    manager_name = models.CharField(
        max_length=100,
        verbose_name=_('Nom du responsable')
    )

    manager_photo = models.ImageField(
        upload_to='driving_schools/managers/',
        blank=True,
        null=True,
        verbose_name=_('Photo du responsable')
    )

    # Informations de contact
    address = models.TextField(
        verbose_name=_('Adresse')
    )

    phone = models.CharField(
        max_length=20,
        verbose_name=_('Téléphone')
    )

    email = models.EmailField(
        verbose_name=_('Email')
    )

    # Numéro d'agrément
    license_number = models.CharField(
        max_length=100,
        default='',
        blank=True,
        verbose_name=_('Numéro d\'agrément'),
        help_text=_('Numéro d\'agrément ou de licence de l\'auto-école')
    )

    # Documents légaux
    cin_document = models.ImageField(
        upload_to='driving_schools/documents/cin/',
        verbose_name=_('Document CIN')
    )

    legal_documents = models.FileField(
        upload_to='driving_schools/documents/legal/',
        verbose_name=_('Documents légaux')
    )

    # Statut et plan
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name=_('Statut')
    )



    # Legacy plan field - kept for backward compatibility
    current_plan = models.CharField(
        max_length=20,
        choices=PLAN_CHOICES,
        default='standard',
        verbose_name=_('Plan actuel (legacy)'),
        help_text=_('Ancien système de plans - sera supprimé')
    )

    # Dates importantes
    plan_start_date = models.DateTimeField(
        default=timezone.now,
        verbose_name=_('Date de début du plan')
    )

    plan_end_date = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name=_('Date de fin du plan')
    )

    # Limites du plan
    max_accounts = models.IntegerField(
        default=10,
        verbose_name=_('Nombre maximum de comptes')
    )

    # Compteur de renouvellements pour le plan Standard
    renewal_count = models.IntegerField(
        default=0,
        verbose_name=_('Nombre de renouvellements')
    )

    current_accounts = models.IntegerField(
        default=0,
        verbose_name=_('Nombre actuel de comptes')
    )

    # Paramètres de personnalisation
    theme_color = models.CharField(
        max_length=7,
        default='#3B82F6',
        verbose_name=_('Couleur du thème')
    )

    dark_mode = models.BooleanField(
        default=False,
        verbose_name=_('Mode sombre')
    )

    # Métadonnées
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('Date de création')
    )

    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_('Date de modification')
    )

    class Meta:
        verbose_name = _('Auto-école')
        verbose_name_plural = _('Auto-écoles')

    def __str__(self):
        return self.name

    # Plan system helper methods
    def get_current_plan(self):
        """Récupérer le plan actuel (système legacy uniquement)"""
        return self._get_legacy_plan()

    def _get_legacy_plan(self):
        """Créer un objet Plan temporaire basé sur l'ancien système"""
        legacy_plans = {
            'standard': {
                'name': 'standard',
                'display_name': 'Standard',
                'price': 49.00,
                'max_accounts': 200,  # Match current system: 200 base + 50 per renewal
                'features': {
                    'can_manage_vehicles': True,
                    'can_access_advanced_stats': False,
                    'can_manage_finances': False,
                    'can_access_priority_support': True,  # Standard has support
                    'can_use_messaging': False,
                    'can_export_data': True,
                }
            },
            'premium': {
                'name': 'premium',
                'display_name': 'Premium',
                'price': 99.00,
                'max_accounts': 999999,  # Unlimited as in current system
                'features': {
                    'can_manage_vehicles': True,
                    'can_access_advanced_stats': True,
                    'can_manage_finances': True,
                    'can_access_priority_support': True,
                    'can_use_messaging': True,
                    'can_export_data': True,
                }
            }
        }

        plan_data = legacy_plans.get(self.current_plan, legacy_plans['standard'])

        # Créer un objet Plan temporaire (non sauvé en DB)
        class LegacyPlan:
            def __init__(self, data):
                self.name = data['name']
                self.display_name = data['display_name']
                self.price = data['price']
                self.max_accounts = data['max_accounts']
                self.features = data['features']
                self.is_active = True
                self.is_trial = False
                self.duration_days = 30
                self.trial_duration_days = 30

            def get_feature(self, feature_name, default=False):
                return self.features.get(feature_name, default)

            @property
            def can_manage_vehicles(self):
                return self.get_feature('can_manage_vehicles', False)

            @property
            def can_access_advanced_stats(self):
                return self.get_feature('can_access_advanced_stats', False)

            @property
            def can_manage_finances(self):
                return self.get_feature('can_manage_finances', False)

            @property
            def can_access_priority_support(self):
                return self.get_feature('can_access_priority_support', False)

            @property
            def can_use_messaging(self):
                return self.get_feature('can_use_messaging', False)

            @property
            def can_export_data(self):
                return self.get_feature('can_export_data', False)

        return LegacyPlan(plan_data)

    def get_max_accounts(self):
        """Récupérer la limite de comptes selon le plan actuel (avec renewals pour Standard)"""
        current_plan = self.get_current_plan()

        # Pour le plan Standard, ajouter 50 comptes par renouvellement
        if hasattr(current_plan, 'name') and current_plan.name == 'standard':
            base_accounts = current_plan.max_accounts  # 200
            renewal_bonus = self.renewal_count * 50
            return base_accounts + renewal_bonus

        return current_plan.max_accounts

    def can_manage_vehicles(self):
        """Vérifier si l'auto-école peut gérer les véhicules"""
        current_plan = self.get_current_plan()
        return current_plan.can_manage_vehicles

    def can_access_advanced_stats(self):
        """Vérifier si l'auto-école peut accéder aux statistiques avancées"""
        current_plan = self.get_current_plan()
        return current_plan.can_access_advanced_stats

    def can_manage_finances(self):
        """Vérifier si l'auto-école peut gérer les finances"""
        current_plan = self.get_current_plan()
        return current_plan.can_manage_finances

    def can_access_priority_support(self):
        """Vérifier si l'auto-école a accès au support prioritaire"""
        current_plan = self.get_current_plan()
        return current_plan.can_access_priority_support

    def can_use_messaging(self):
        """Vérifier si l'auto-école peut utiliser la messagerie"""
        current_plan = self.get_current_plan()
        return current_plan.can_use_messaging

    def can_export_data(self):
        """Vérifier si l'auto-école peut exporter des données"""
        current_plan = self.get_current_plan()
        return current_plan.can_export_data

    def save(self, *args, **kwargs):
        # Vérifier si le plan a changé
        plan_changed = False
        if self.pk:  # Si l'objet existe déjà
            try:
                old_instance = DrivingSchool.objects.get(pk=self.pk)
                if old_instance.current_plan != self.current_plan:
                    plan_changed = True
            except DrivingSchool.DoesNotExist:
                pass

        # Définir la date de fin du plan lors de la création
        if not self.plan_end_date:
            # Toutes les nouvelles auto-écoles ont 30 jours gratuits de plan Standard
            self.plan_end_date = self.plan_start_date + timedelta(days=30)

        # Ajuster les limites de comptes selon le plan
        if self.current_plan == 'free':
            self.max_accounts = 50
            self.renewal_count = 0
        elif self.current_plan == 'standard':
            if self.max_accounts < 200:  # Si pas encore défini ou inférieur
                self.max_accounts = 200 + (self.renewal_count * 50)
        elif self.current_plan == 'premium':
            self.max_accounts = 999999  # Illimité

        # Vérifier si le changement de plan est compatible avec le nombre de comptes actifs
        if plan_changed and self.pk:
            current_accounts = self.actual_current_accounts
            if self.current_plan == 'free' and current_accounts > 50:
                print(f"ATTENTION: {self.name} a {current_accounts} comptes actifs mais passe au plan gratuit (limite: 50)")
            elif self.current_plan == 'standard' and current_accounts > self.max_accounts:
                print(f"ATTENTION: {self.name} a {current_accounts} comptes actifs mais passe au plan standard (limite: {self.max_accounts})")

        super().save(*args, **kwargs)

        # Si le plan a changé, annuler les demandes en attente
        if plan_changed:
            self._cancel_pending_upgrade_requests()

    def _cancel_pending_upgrade_requests(self):
        """Annule toutes les demandes de mise à niveau en attente"""
        try:
            pending_requests = self.upgrade_requests.filter(status='pending')

            for request in pending_requests:
                request.status = 'cancelled'
                request.admin_notes = f'Annulé automatiquement - Plan changé directement vers {self.current_plan} par l\'administrateur'
                request.processed_at = timezone.now()
                request.save()

            if pending_requests.exists():
                print(f"Annulé {pending_requests.count()} demande(s) en attente pour {self.name}")

        except Exception as e:
            print(f"Erreur lors de l'annulation des demandes: {e}")

    @property
    def is_plan_expired(self):
        """Vérifie si le plan actuel a expiré"""
        return timezone.now() > self.plan_end_date

    @property
    def days_remaining(self):
        """Retourne le nombre de jours restants du plan"""
        if self.plan_end_date:
            remaining = self.plan_end_date - timezone.now()
            return max(0, remaining.days)
        return 0

    @property
    def can_add_accounts(self):
        """Vérifie si l'auto-école peut ajouter des comptes"""
        return self.current_accounts < self.max_accounts

    def update_current_accounts(self):
        """Met à jour le nombre actuel de comptes"""
        # Compter le propriétaire de l'auto-école (1)
        count = 1

        # Compter les moniteurs
        count += self.instructors.count()

        # Compter les candidats
        count += self.students.count()

        # Mettre à jour le champ
        self.current_accounts = count
        self.save(update_fields=['current_accounts'])

        return count

    @property
    def actual_current_accounts(self):
        """Retourne le nombre réel de comptes (calculé en temps réel)"""
        # Compter le propriétaire de l'auto-école (1)
        count = 1

        # Compter les moniteurs
        count += self.instructors.count()

        # Compter les candidats
        count += self.students.count()

        return count


class Expense(models.Model):
    """
    Modèle pour les dépenses de l'auto-école (plan Premium uniquement)
    """
    EXPENSE_CATEGORIES = (
        ('rent', _('Loyer')),
        ('utilities', _('Charges')),
        ('insurance', _('Assurance')),
        ('fuel', _('Carburant')),
        ('maintenance', _('Maintenance')),
        ('salaries', _('Salaires')),
        ('marketing', _('Marketing')),
        ('equipment', _('Équipement')),
        ('training', _('Formation')),
        ('administrative', _('Administratif')),
        ('other', _('Autre')),
    )

    # Relations
    driving_school = models.ForeignKey(
        DrivingSchool,
        on_delete=models.CASCADE,
        related_name='expenses',
        verbose_name=_('Auto-école')
    )

    # Informations de la dépense
    category = models.CharField(
        max_length=20,
        choices=EXPENSE_CATEGORIES,
        verbose_name=_('Catégorie')
    )

    description = models.CharField(
        max_length=200,
        verbose_name=_('Description')
    )

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name=_('Montant')
    )

    date = models.DateField(
        verbose_name=_('Date')
    )

    # Documents justificatifs
    receipt = models.FileField(
        upload_to='expenses/receipts/',
        blank=True,
        null=True,
        verbose_name=_('Reçu')
    )

    # Informations supplémentaires
    supplier = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        verbose_name=_('Fournisseur')
    )

    reference_number = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name=_('Numéro de référence')
    )

    is_recurring = models.BooleanField(
        default=False,
        verbose_name=_('Récurrent')
    )

    # Métadonnées
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('Date de création')
    )

    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_('Date de modification')
    )

    class Meta:
        verbose_name = _('Dépense')
        verbose_name_plural = _('Dépenses')
        ordering = ['-date']

    def __str__(self):
        return f"{self.description} - {self.amount}€"


class Revenue(models.Model):
    """
    Modèle pour les revenus de l'auto-école (plan Premium uniquement)
    """
    REVENUE_SOURCES = (
        ('student_fees', _('Frais étudiants')),
        ('exam_fees', _('Frais d\'examens')),
        ('additional_services', _('Services supplémentaires')),
        ('other', _('Autre')),
    )

    # Relations
    driving_school = models.ForeignKey(
        DrivingSchool,
        on_delete=models.CASCADE,
        related_name='revenues',
        verbose_name=_('Auto-école')
    )

    student = models.ForeignKey(
        'students.Student',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='generated_revenues',
        verbose_name=_('Candidat')
    )

    # Informations du revenu
    source = models.CharField(
        max_length=20,
        choices=REVENUE_SOURCES,
        verbose_name=_('Source')
    )

    description = models.CharField(
        max_length=200,
        verbose_name=_('Description')
    )

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name=_('Montant')
    )

    date = models.DateField(
        verbose_name=_('Date')
    )

    # Informations supplémentaires
    reference_number = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name=_('Numéro de référence')
    )

    # Métadonnées
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('Date de création')
    )

    class Meta:
        verbose_name = _('Revenu')
        verbose_name_plural = _('Revenus')
        ordering = ['-date']

    def __str__(self):
        return f"{self.description} - {self.amount}€"


class UpgradeRequest(models.Model):
    """
    Modèle pour les demandes de mise à niveau d'abonnement
    """
    STATUS_CHOICES = (
        ('pending', _('En attente')),
        ('approved', _('Approuvé')),
        ('rejected', _('Rejeté')),
        ('cancelled', _('Annulé')),
    )

    PAYMENT_METHOD_CHOICES = (
        ('bank_transfer', _('Virement bancaire')),
        ('card', _('Carte bancaire')),
        ('flouci', _('Flouci')),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    driving_school = models.ForeignKey(
        'DrivingSchool',
        on_delete=models.CASCADE,
        related_name='upgrade_requests',
        verbose_name=_('Auto-école')
    )

    # Plan details
    current_plan = models.CharField(
        max_length=20,
        choices=DrivingSchool.PLAN_CHOICES,
        verbose_name=_('Plan actuel')
    )
    requested_plan = models.CharField(
        max_length=20,
        choices=DrivingSchool.PLAN_CHOICES,
        verbose_name=_('Plan demandé')
    )

    # Payment details
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        verbose_name=_('Méthode de paiement')
    )
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name=_('Montant')
    )

    # Indique si c'est un renouvellement
    is_renewal = models.BooleanField(
        default=False,
        verbose_name=_('Renouvellement')
    )

    # Status and dates
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name=_('Statut')
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('Date de création')
    )
    processed_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('Date de traitement')
    )
    processed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='processed_upgrades',
        verbose_name=_('Traité par')
    )

    # Admin notes
    admin_notes = models.TextField(
        blank=True,
        verbose_name=_('Notes administrateur')
    )

    class Meta:
        verbose_name = _('Demande de mise à niveau')
        verbose_name_plural = _('Demandes de mise à niveau')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.driving_school.name} - {self.current_plan} → {self.requested_plan}"

    @property
    def is_pending(self):
        return self.status == 'pending'

    @property
    def is_approved(self):
        return self.status == 'approved'


class PaymentProof(models.Model):
    """
    Modèle pour les justificatifs de paiement
    """
    upgrade_request = models.OneToOneField(
        UpgradeRequest,
        on_delete=models.CASCADE,
        related_name='payment_proof',
        verbose_name=_('Demande de mise à niveau')
    )

    # File upload
    receipt_file = models.FileField(
        upload_to='payment_proofs/',
        verbose_name=_('Justificatif de paiement')
    )

    # Transfer details for bank transfer
    transfer_reference = models.CharField(
        max_length=100,
        blank=True,
        verbose_name=_('Référence du virement')
    )
    transfer_date = models.DateField(
        null=True,
        blank=True,
        verbose_name=_('Date du virement')
    )

    uploaded_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('Date d\'upload')
    )

    class Meta:
        verbose_name = _('Justificatif de paiement')
        verbose_name_plural = _('Justificatifs de paiement')

    def __str__(self):
        return f"Justificatif - {self.upgrade_request}"


class VehicleExpense(models.Model):
    """
    Modèle pour les dépenses liées aux véhicules (Premium uniquement)
    """
    EXPENSE_CATEGORIES = (
        ('fuel', _('Carburant')),
        ('maintenance', _('Entretien')),
        ('repair', _('Réparation')),
        ('insurance', _('Assurance')),
        ('inspection', _('Visite technique')),
        ('other', _('Autre')),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    vehicle = models.ForeignKey(
        'vehicles.Vehicle',
        on_delete=models.CASCADE,
        related_name='expenses',
        verbose_name=_('Véhicule')
    )
    driving_school = models.ForeignKey(
        'DrivingSchool',
        on_delete=models.CASCADE,
        related_name='vehicle_expenses',
        verbose_name=_('Auto-école')
    )

    # Détails de la dépense
    category = models.CharField(
        max_length=20,
        choices=EXPENSE_CATEGORIES,
        verbose_name=_('Catégorie')
    )
    description = models.CharField(
        max_length=255,
        verbose_name=_('Description')
    )
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name=_('Montant (DT)')
    )
    date = models.DateField(
        verbose_name=_('Date')
    )

    # Informations supplémentaires
    odometer_reading = models.IntegerField(
        null=True,
        blank=True,
        verbose_name=_('Kilométrage')
    )
    receipt = models.FileField(
        upload_to='vehicle_receipts/',
        null=True,
        blank=True,
        verbose_name=_('Reçu/Facture')
    )
    notes = models.TextField(
        blank=True,
        verbose_name=_('Notes')
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('Date de création')
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_('Date de modification')
    )

    class Meta:
        verbose_name = _('Dépense véhicule')
        verbose_name_plural = _('Dépenses véhicules')
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.vehicle} - {self.get_category_display()} - {self.amount} DT"


class AccountingEntry(models.Model):
    """
    Modèle pour les écritures comptables (Premium uniquement)
    """
    ENTRY_TYPES = (
        ('expense', _('Dépense')),
        ('revenue', _('Recette')),
    )

    EXPENSE_CATEGORIES = (
        ('vehicle', _('Véhicule')),
        ('subscription', _('Abonnement')),
        ('rent', _('Loyer')),
        ('salary', _('Salaire')),
        ('utilities', _('Services publics')),
        ('office', _('Fournitures bureau')),
        ('marketing', _('Marketing')),
        ('insurance', _('Assurance')),
        ('other', _('Autre')),
    )

    REVENUE_CATEGORIES = (
        ('student_fees', _('Frais étudiants')),
        ('exam_fees', _('Frais examens')),
        ('additional_services', _('Services supplémentaires')),
        ('other', _('Autre')),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    driving_school = models.ForeignKey(
        'DrivingSchool',
        on_delete=models.CASCADE,
        related_name='accounting_entries',
        verbose_name=_('Auto-école')
    )

    # Type et catégorie
    entry_type = models.CharField(
        max_length=20,
        choices=ENTRY_TYPES,
        verbose_name=_('Type')
    )
    category = models.CharField(
        max_length=50,
        verbose_name=_('Catégorie')
    )

    # Détails
    description = models.CharField(
        max_length=255,
        verbose_name=_('Description')
    )
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name=_('Montant (DT)')
    )
    date = models.DateField(
        verbose_name=_('Date')
    )

    # Références optionnelles
    vehicle_expense = models.OneToOneField(
        VehicleExpense,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='accounting_entry',
        verbose_name=_('Dépense véhicule liée')
    )

    # Documents
    receipt = models.FileField(
        upload_to='accounting_receipts/',
        null=True,
        blank=True,
        verbose_name=_('Justificatif')
    )
    notes = models.TextField(
        blank=True,
        verbose_name=_('Notes')
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('Date de création')
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_('Date de modification')
    )

    class Meta:
        verbose_name = _('Écriture comptable')
        verbose_name_plural = _('Écritures comptables')
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.get_entry_type_display()} - {self.description} - {self.amount} DT"
