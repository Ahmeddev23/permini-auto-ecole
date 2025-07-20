from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from datetime import timedelta


class Vehicle(models.Model):
    """
    Modèle pour les véhicules d'auto-école
    """
    VEHICLE_TYPES = (
        ('A', _('Moto')),
        ('B', _('Voiture')),
        ('C', _('Camion')),
        ('D', _('Bus')),
    )

    STATUS_CHOICES = (
        ('active', _('Actif')),
        ('maintenance', _('En maintenance')),
        ('inactive', _('Inactif')),
    )

    # Relation avec l'auto-école
    driving_school = models.ForeignKey(
        'driving_schools.DrivingSchool',
        on_delete=models.CASCADE,
        related_name='vehicles',
        verbose_name=_('Auto-école')
    )

    # Relation avec le moniteur assigné
    assigned_instructor = models.ForeignKey(
        'instructors.Instructor',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='assigned_vehicles',
        verbose_name=_('Moniteur assigné')
    )

    # Informations du véhicule
    license_plate = models.CharField(
        max_length=20,
        unique=True,
        verbose_name=_('Matriculation')
    )

    photo = models.ImageField(
        upload_to='vehicles/photos/',
        blank=True,
        null=True,
        verbose_name=_('Photo du véhicule')
    )

    brand = models.CharField(
        max_length=50,
        verbose_name=_('Marque')
    )

    model = models.CharField(
        max_length=50,
        verbose_name=_('Modèle')
    )

    year = models.IntegerField(
        verbose_name=_('Année')
    )

    color = models.CharField(
        max_length=30,
        verbose_name=_('Couleur')
    )

    vehicle_type = models.CharField(
        max_length=1,
        choices=VEHICLE_TYPES,
        verbose_name=_('Type de véhicule')
    )

    # Informations techniques
    engine_number = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name=_('Numéro moteur')
    )

    chassis_number = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name=_('Numéro châssis')
    )

    # Kilométrage
    current_mileage = models.IntegerField(
        default=0,
        verbose_name=_('Kilométrage actuel')
    )

    # Dates importantes
    technical_inspection_date = models.DateField(
        verbose_name=_('Date visite technique')
    )

    insurance_expiry_date = models.DateField(
        verbose_name=_('Date expiration assurance')
    )

    # Statut
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active',
        verbose_name=_('Statut')
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
        verbose_name = _('Véhicule')
        verbose_name_plural = _('Véhicules')

    def __str__(self):
        return f"{self.brand} {self.model} ({self.license_plate})"

    @property
    def is_technical_inspection_due(self):
        """Vérifie si la visite technique arrive à échéance (dans 30 jours)"""
        return self.technical_inspection_date <= timezone.now().date() + timedelta(days=30)

    @property
    def is_insurance_due(self):
        """Vérifie si l'assurance arrive à échéance (dans 30 jours)"""
        return self.insurance_expiry_date <= timezone.now().date() + timedelta(days=30)
