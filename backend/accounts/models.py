from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    """
    Modèle utilisateur personnalisé pour Permini
    """
    USER_TYPES = (
        ('admin', _('Administrateur')),
        ('driving_school', _('Auto-école')),
        ('instructor', _('Moniteur')),
        ('student', _('Candidat')),
    )

    user_type = models.CharField(
        max_length=20,
        choices=USER_TYPES,
        default='student',
        verbose_name=_('Type d\'utilisateur')
    )

    phone = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        verbose_name=_('Téléphone')
    )

    cin = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        unique=True,
        verbose_name=_('CIN')
    )

    photo = models.ImageField(
        upload_to='users/photos/',
        blank=True,
        null=True,
        verbose_name=_('Photo')
    )

    is_verified = models.BooleanField(
        default=False,
        verbose_name=_('Vérifié')
    )

    verification_code = models.CharField(
        max_length=6,
        blank=True,
        null=True,
        verbose_name=_('Code de vérification')
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
        verbose_name = _('Utilisateur')
        verbose_name_plural = _('Utilisateurs')

    def __str__(self):
        return f"{self.username} ({self.get_user_type_display()})"
