from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class Instructor(models.Model):
    """
    Modèle pour les moniteurs d'auto-école
    """
    LICENSE_TYPES = (
        ('A', _('Permis A (Moto)')),
        ('B', _('Permis B (Voiture)')),
        ('C', _('Permis C (Camion)')),
        ('D', _('Permis D (Bus)')),
    )

    # Relation avec l'utilisateur
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='instructor_profile',
        verbose_name=_('Utilisateur')
    )

    # Relation avec l'auto-école
    driving_school = models.ForeignKey(
        'driving_schools.DrivingSchool',
        on_delete=models.CASCADE,
        related_name='instructors',
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
        upload_to='instructors/photos/',
        blank=True,
        null=True,
        verbose_name=_('Photo')
    )

    # Informations professionnelles
    license_types = models.CharField(
        max_length=10,
        verbose_name=_('Types de permis')
    )  # Stockage des types séparés par des virgules

    hire_date = models.DateField(
        verbose_name=_('Date d\'embauche')
    )

    salary = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name=_('Salaire')
    )

    # Statut
    is_active = models.BooleanField(
        default=True,
        verbose_name=_('Actif')
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
        verbose_name = _('Moniteur')
        verbose_name_plural = _('Moniteurs')

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    def get_license_types_list(self):
        """Retourne la liste des types de permis"""
        if self.license_types:
            return self.license_types.split(',')
        return []

    def set_license_types_list(self, types_list):
        """Définit les types de permis à partir d'une liste"""
        self.license_types = ','.join(types_list)
