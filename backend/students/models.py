from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class Student(models.Model):
    """
    Modèle pour les candidats/étudiants
    """
    LICENSE_TYPES = (
        ('A', _('Permis A (Moto)')),
        ('B', _('Permis B (Voiture)')),
        ('C', _('Permis C (Camion)')),
        ('D', _('Permis D (Bus)')),
    )

    PAYMENT_TYPES = (
        ('fixed', _('Tarif fixe')),
        ('hourly', _('Par heure')),
    )

    FORMATION_STATUS = (
        ('registered', _('Inscrit')),
        ('theory_in_progress', _('Code en cours')),
        ('theory_passed', _('Code réussi')),
        ('practical_in_progress', _('Conduite en cours')),
        ('practical_passed', _('Conduite réussie')),
        ('completed', _('Formation terminée')),
        ('suspended', _('Suspendu')),
    )

    # Relation avec l'utilisateur
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='student',
        verbose_name=_('Utilisateur')
    )

    # Relation avec l'auto-école
    driving_school = models.ForeignKey(
        'driving_schools.DrivingSchool',
        on_delete=models.CASCADE,
        related_name='students',
        verbose_name=_('Auto-école')
    )

    # Informations personnelles
    first_name = models.CharField(
        max_length=50,
        verbose_name=_('Prénom')
    )

    last_name = models.CharField(
        max_length=50,
        verbose_name=_('Nom')
    )

    cin = models.CharField(
        max_length=20,
        unique=True,
        verbose_name=_('CIN')
    )

    phone = models.CharField(
        max_length=20,
        verbose_name=_('Téléphone')
    )

    email = models.EmailField(
        verbose_name=_('Email')
    )

    photo = models.ImageField(
        upload_to='students/photos/',
        blank=True,
        null=True,
        verbose_name=_('Photo')
    )

    date_of_birth = models.DateField(
        verbose_name=_('Date de naissance')
    )

    address = models.TextField(
        verbose_name=_('Adresse')
    )

    # Informations de formation
    license_type = models.CharField(
        max_length=1,
        choices=LICENSE_TYPES,
        verbose_name=_('Type de permis')
    )

    registration_date = models.DateField(
        auto_now_add=True,
        verbose_name=_('Date d\'inscription')
    )

    formation_status = models.CharField(
        max_length=30,
        choices=FORMATION_STATUS,
        default='registered',
        verbose_name=_('Statut de formation')
    )

    # Informations de paiement
    payment_type = models.CharField(
        max_length=10,
        choices=PAYMENT_TYPES,
        default='fixed',
        verbose_name=_('Type de paiement')
    )

    fixed_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name=_('Prix fixe')
    )

    hourly_rate = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name=_('Tarif horaire')
    )

    # Progression
    theory_hours_completed = models.DecimalField(
        max_digits=5,
        decimal_places=1,
        default=0,
        verbose_name=_('Heures de code effectuées')
    )

    practical_hours_completed = models.DecimalField(
        max_digits=5,
        decimal_places=1,
        default=0,
        verbose_name=_('Heures de conduite effectuées')
    )

    theory_exam_attempts = models.IntegerField(
        default=0,
        verbose_name=_('Tentatives examen code')
    )

    practical_exam_attempts = models.IntegerField(
        default=0,
        verbose_name=_('Tentatives examen conduite')
    )

    # Statut
    is_active = models.BooleanField(
        default=True,
        verbose_name=_('Actif')
    )

    # Tarification totale
    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=3,
        null=True,
        blank=True,
        verbose_name=_('Montant total (DT)')
    )

    total_sessions = models.IntegerField(
        null=True,
        blank=True,
        verbose_name=_('Nombre total de séances')
    )

    paid_amount = models.DecimalField(
        max_digits=10,
        decimal_places=3,
        default=0,
        verbose_name=_('Montant payé (DT)')
    )

    paid_sessions = models.IntegerField(
        default=0,
        verbose_name=_('Séances payées')
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
        verbose_name = _('Candidat')
        verbose_name_plural = _('Candidats')

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def total_hours_completed(self):
        return self.theory_hours_completed + self.practical_hours_completed

    @property
    def total_amount_due(self):
        """Calcule le montant total dû selon le type de paiement"""
        if self.payment_type == 'fixed':
            return self.fixed_price or 0
        else:
            return (self.hourly_rate or 0) * self.total_hours_completed
