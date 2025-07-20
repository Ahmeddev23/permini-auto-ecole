from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.conf import settings
from decimal import Decimal


class Payment(models.Model):
    """
    Modèle pour les paiements des candidats
    """
    PAYMENT_TYPES = (
        ('registration', _('Inscription')),
        ('monthly', _('Mensuel')),
        ('lesson', _('Séance')),
        ('exam', _('Examen')),
        ('additional', _('Supplément')),
        ('fixed_payment', _('Paiement fixe')),
        ('session_payment', _('Paiement par séances')),
    )

    PAYMENT_STATUS = (
        ('pending', _('En attente')),
        ('paid', _('Payé')),
        ('overdue', _('En retard')),
        ('cancelled', _('Annulé')),
    )

    PAYMENT_METHODS = (
        ('cash', _('Espèces')),
        ('bank_transfer', _('Virement bancaire')),
        ('check', _('Chèque')),
        ('online', _('Paiement en ligne')),
    )

    # Relations
    driving_school = models.ForeignKey(
        'driving_schools.DrivingSchool',
        on_delete=models.CASCADE,
        related_name='payments',
        verbose_name=_('Auto-école')
    )

    student = models.ForeignKey(
        'students.Student',
        on_delete=models.CASCADE,
        related_name='payments',
        verbose_name=_('Candidat')
    )

    # Informations du paiement
    payment_type = models.CharField(
        max_length=20,
        choices=PAYMENT_TYPES,
        verbose_name=_('Type de paiement')
    )

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name=_('Montant')
    )

    due_date = models.DateField(
        verbose_name=_('Date d\'échéance')
    )

    payment_date = models.DateField(
        blank=True,
        null=True,
        verbose_name=_('Date de paiement')
    )

    status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS,
        default='pending',
        verbose_name=_('Statut')
    )

    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHODS,
        blank=True,
        null=True,
        verbose_name=_('Méthode de paiement')
    )

    # Détails supplémentaires
    description = models.TextField(
        blank=True,
        null=True,
        verbose_name=_('Description')
    )

    reference_number = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name=_('Numéro de référence')
    )

    receipt_number = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name=_('Numéro de reçu')
    )

    # Heures facturées (pour paiement par heure)
    theory_hours = models.IntegerField(
        default=0,
        verbose_name=_('Heures de code')
    )

    practical_hours = models.IntegerField(
        default=0,
        verbose_name=_('Heures de conduite')
    )

    # Nombre de séances (pour paiement par séances)
    session_count = models.IntegerField(
        default=0,
        verbose_name=_('Nombre de séances')
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
        verbose_name = _('Paiement')
        verbose_name_plural = _('Paiements')
        ordering = ['-due_date']

    def __str__(self):
        return f"{self.student} - {self.get_payment_type_display()} - {self.amount}€"

    @property
    def is_overdue(self):
        """Vérifie si le paiement est en retard"""
        return self.status == 'pending' and self.due_date < timezone.now().date()

    @property
    def days_overdue(self):
        """Nombre de jours de retard"""
        if self.is_overdue:
            return (timezone.now().date() - self.due_date).days
        return 0

    def save(self, *args, **kwargs):
        # Mettre à jour le statut automatiquement
        if self.status == 'pending' and self.due_date < timezone.now().date():
            self.status = 'overdue'

        super().save(*args, **kwargs)


class SubscriptionPayment(models.Model):
    """
    Modèle pour les paiements d'abonnement des auto-écoles
    """
    PLAN_TYPES = (
        ('standard', _('Standard')),
        ('premium', _('Premium')),
    )

    PAYMENT_STATUS = (
        ('pending', _('En attente')),
        ('paid', _('Payé')),
        ('failed', _('Échoué')),
        ('refunded', _('Remboursé')),
    )

    PAYMENT_METHODS = (
        ('bank_transfer', _('Virement bancaire')),
        ('online', _('Paiement en ligne')),
    )

    # Relations
    driving_school = models.ForeignKey(
        'driving_schools.DrivingSchool',
        on_delete=models.CASCADE,
        related_name='subscription_payments',
        verbose_name=_('Auto-école')
    )

    # Informations du paiement
    plan_type = models.CharField(
        max_length=20,
        choices=PLAN_TYPES,
        verbose_name=_('Type de plan')
    )

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name=_('Montant')
    )

    billing_period_start = models.DateField(
        verbose_name=_('Début de période')
    )

    billing_period_end = models.DateField(
        verbose_name=_('Fin de période')
    )

    payment_date = models.DateField(
        blank=True,
        null=True,
        verbose_name=_('Date de paiement')
    )

    status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS,
        default='pending',
        verbose_name=_('Statut')
    )

    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHODS,
        verbose_name=_('Méthode de paiement')
    )

    # Détails du paiement
    transaction_id = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        verbose_name=_('ID de transaction')
    )

    payment_proof = models.FileField(
        upload_to='payments/proofs/',
        blank=True,
        null=True,
        verbose_name=_('Preuve de paiement')
    )

    notes = models.TextField(
        blank=True,
        null=True,
        verbose_name=_('Notes')
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
        verbose_name = _('Paiement d\'abonnement')
        verbose_name_plural = _('Paiements d\'abonnements')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.driving_school} - {self.get_plan_type_display()} - {self.amount}€"


class PaymentLog(models.Model):
    """
    Modèle pour l'historique des paiements des candidats
    """
    # Relations
    student = models.ForeignKey(
        'students.Student',
        on_delete=models.CASCADE,
        related_name='payment_logs',
        verbose_name=_('Candidat')
    )

    # Informations du paiement
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=3,
        verbose_name=_('Montant (DT)')
    )

    sessions_count = models.IntegerField(
        default=0,
        verbose_name=_('Nombre de séances')
    )

    description = models.TextField(
        blank=True,
        null=True,
        verbose_name=_('Description')
    )

    # Métadonnées
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('Date de création')
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name=_('Créé par')
    )

    class Meta:
        verbose_name = _('Historique de paiement')
        verbose_name_plural = _('Historiques de paiements')
        ordering = ['-created_at']

    def __str__(self):
        if self.sessions_count > 0:
            return f"{self.student} - {self.amount} DT / {self.sessions_count} séances"
        return f"{self.student} - {self.amount} DT"


class FlouciPayment(models.Model):
    """
    Modèle pour les paiements Flouci
    """
    FLOUCI_STATUS = (
        ('pending', _('En attente')),
        ('success', _('Réussi')),
        ('failed', _('Échoué')),
        ('cancelled', _('Annulé')),
    )

    upgrade_request = models.OneToOneField(
        'driving_schools.UpgradeRequest',
        on_delete=models.CASCADE,
        related_name='flouci_payment',
        verbose_name=_('Demande d\'upgrade')
    )

    phone_number = models.CharField(
        max_length=20,
        verbose_name=_('Numéro de téléphone')
    )

    flouci_token = models.CharField(
        max_length=100,
        verbose_name=_('Token Flouci'),
        unique=True
    )

    status = models.CharField(
        max_length=20,
        choices=FLOUCI_STATUS,
        default='pending',
        verbose_name=_('Statut')
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
        verbose_name = _('Paiement Flouci')
        verbose_name_plural = _('Paiements Flouci')
        ordering = ['-created_at']

    def __str__(self):
        return f"Flouci {self.flouci_token} - {self.upgrade_request.driving_school.name}"
