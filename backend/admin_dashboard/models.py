from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
import uuid


class AdminUser(models.Model):
    """Modèle pour les utilisateurs administrateurs"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)

    # Permissions admin
    is_active = models.BooleanField(default=True)
    is_superadmin = models.BooleanField(default=False)

    # Permissions spécifiques
    can_manage_driving_schools = models.BooleanField(default=True)
    can_manage_users = models.BooleanField(default=True)
    can_view_logs = models.BooleanField(default=True)
    can_manage_system = models.BooleanField(default=False)
    can_send_notifications = models.BooleanField(default=True)

    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login = models.DateTimeField(null=True, blank=True)
    login_count = models.IntegerField(default=0)

    class Meta:
        db_table = 'admin_users'
        verbose_name = _('Administrateur')
        verbose_name_plural = _('Administrateurs')

    def __str__(self):
        return f"{self.username} ({self.email})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.username


class AdminSession(models.Model):
    """Modèle pour les sessions admin"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    admin_user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='admin_sessions')
    session_key = models.CharField(max_length=40, unique=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'admin_sessions'
        verbose_name = _('Session Admin')
        verbose_name_plural = _('Sessions Admin')


class AdminActionLog(models.Model):
    """Modèle pour les logs d'actions admin"""
    ACTION_TYPES = [
        ('login', 'Connexion'),
        ('logout', 'Déconnexion'),
        ('create', 'Création'),
        ('update', 'Modification'),
        ('delete', 'Suppression'),
        ('view', 'Consultation'),
        ('approve', 'Approbation'),
        ('suspend', 'Suspension'),
        ('message', 'Message'),
        ('notification', 'Notification'),
        ('export', 'Export'),
        ('system', 'Système'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    admin_user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='admin_action_logs')
    action_type = models.CharField(max_length=20, choices=ACTION_TYPES)
    target_model = models.CharField(max_length=100, blank=True, null=True)  # Modèle ciblé
    target_id = models.CharField(max_length=100, blank=True, null=True)     # ID de l'objet ciblé
    description = models.TextField()
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # Données supplémentaires (JSON)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = 'admin_action_logs'
        verbose_name = _('Log d\'action admin')
        verbose_name_plural = _('Logs d\'actions admin')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.admin_user.username} - {self.get_action_type_display()} - {self.created_at}"


class SystemSettings(models.Model):
    """Modèle pour les paramètres système"""
    key = models.CharField(max_length=100, unique=True, primary_key=True)
    value = models.TextField()
    description = models.TextField(blank=True)
    is_public = models.BooleanField(default=False)  # Visible aux utilisateurs normaux
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        db_table = 'system_settings'
        verbose_name = _('Paramètre système')
        verbose_name_plural = _('Paramètres système')

    def __str__(self):
        return f"{self.key}: {self.value[:50]}..."


class ContactFormSubmission(models.Model):
    """Modèle pour les soumissions du formulaire de contact"""
    STATUS_CHOICES = [
        ('new', 'Nouveau'),
        ('in_progress', 'En cours'),
        ('resolved', 'Résolu'),
        ('closed', 'Fermé'),
    ]

    PRIORITY_CHOICES = [
        ('low', 'Faible'),
        ('medium', 'Moyenne'),
        ('high', 'Élevée'),
        ('urgent', 'Urgente'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    subject = models.CharField(max_length=300)
    message = models.TextField()

    # Gestion
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    assigned_to = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_contacts')

    # Réponse
    admin_response = models.TextField(blank=True)
    responded_at = models.DateTimeField(null=True, blank=True)
    responded_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='responded_contacts')

    # Métadonnées
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'contact_form_submissions'
        verbose_name = _('Soumission de contact')
        verbose_name_plural = _('Soumissions de contact')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.subject} ({self.get_status_display()})"


class SystemAnnouncement(models.Model):
    """Modèle pour les annonces système"""
    TARGET_CHOICES = [
        ('all', 'Tous les utilisateurs'),
        ('driving_schools', 'Auto-écoles'),
        ('instructors', 'Moniteurs'),
        ('students', 'Étudiants'),
    ]

    TYPE_CHOICES = [
        ('info', 'Information'),
        ('warning', 'Avertissement'),
        ('maintenance', 'Maintenance'),
        ('feature', 'Nouvelle fonctionnalité'),
        ('promotion', 'Promotion'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    content = models.TextField()
    announcement_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='info')
    target_audience = models.CharField(max_length=20, choices=TARGET_CHOICES, default='all')

    # Planification
    is_active = models.BooleanField(default=True)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField(null=True, blank=True)

    # Affichage
    is_popup = models.BooleanField(default=False)  # Afficher en popup
    is_dismissible = models.BooleanField(default=True)  # Peut être fermé
    priority = models.IntegerField(default=1)  # Ordre d'affichage

    # Métadonnées
    created_by = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='admin_announcements')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Statistiques
    view_count = models.IntegerField(default=0)
    click_count = models.IntegerField(default=0)

    class Meta:
        db_table = 'system_announcements'
        verbose_name = _('Annonce système')
        verbose_name_plural = _('Annonces système')
        ordering = ['-priority', '-created_at']

    def __str__(self):
        return f"{self.title} ({self.get_target_audience_display()})"


class Coupon(models.Model):
    """
    Modèle pour les coupons de réduction
    """
    COUPON_STATUS = (
        ('active', _('Actif')),
        ('inactive', _('Inactif')),
        ('expired', _('Expiré')),
        ('used_up', _('Épuisé')),
    )

    # Informations de base
    code = models.CharField(
        max_length=50,
        unique=True,
        verbose_name=_('Code du coupon'),
        help_text=_('Code unique du coupon (ex: REDUCTION20)')
    )

    name = models.CharField(
        max_length=200,
        verbose_name=_('Nom du coupon'),
        help_text=_('Nom descriptif du coupon')
    )

    description = models.TextField(
        blank=True,
        verbose_name=_('Description'),
        help_text=_('Description détaillée du coupon')
    )

    # Réduction
    discount_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        verbose_name=_('Pourcentage de réduction'),
        help_text=_('Pourcentage de réduction (ex: 20.00 pour 20%)')
    )

    # Validité
    valid_from = models.DateTimeField(
        verbose_name=_('Valide à partir de'),
        help_text=_('Date et heure de début de validité')
    )

    valid_until = models.DateTimeField(
        verbose_name=_('Valide jusqu\'à'),
        help_text=_('Date et heure de fin de validité')
    )

    # Limitations d'usage
    max_uses = models.PositiveIntegerField(
        default=1,
        verbose_name=_('Nombre maximum d\'utilisations'),
        help_text=_('Nombre maximum de fois que le coupon peut être utilisé')
    )

    current_uses = models.PositiveIntegerField(
        default=0,
        verbose_name=_('Utilisations actuelles'),
        help_text=_('Nombre de fois que le coupon a été utilisé')
    )

    # Statut
    status = models.CharField(
        max_length=20,
        choices=COUPON_STATUS,
        default='active',
        verbose_name=_('Statut')
    )

    # Métadonnées
    created_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='created_coupons',
        verbose_name=_('Créé par')
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
        db_table = 'coupons'
        verbose_name = _('Coupon')
        verbose_name_plural = _('Coupons')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.code} - {self.discount_percentage}%"

    def is_valid(self):
        """Vérifie si le coupon est valide"""
        from django.utils import timezone
        now = timezone.now()

        return (
            self.status == 'active' and
            self.valid_from <= now <= self.valid_until and
            self.current_uses < self.max_uses
        )

    def can_be_used(self):
        """Vérifie si le coupon peut être utilisé"""
        return self.is_valid()

    def use_coupon(self):
        """Utilise le coupon (incrémente le compteur)"""
        if self.can_be_used():
            self.current_uses += 1
            if self.current_uses >= self.max_uses:
                self.status = 'used_up'
            self.save()
            return True
        return False

    @property
    def remaining_uses(self):
        """Retourne le nombre d'utilisations restantes"""
        return max(0, self.max_uses - self.current_uses)


class AdminNotification(models.Model):
    """
    Modèle pour les notifications admin
    """
    NOTIFICATION_TYPES = (
        ('driving_school_registration', _('Inscription auto-école')),
        ('payment_received', _('Paiement reçu')),
        ('upgrade_request', _('Demande de mise à niveau')),
        ('contact_form', _('Formulaire de contact')),
        ('system_alert', _('Alerte système')),
    )

    PRIORITY_LEVELS = (
        ('low', _('Faible')),
        ('medium', _('Moyen')),
        ('high', _('Élevé')),
        ('urgent', _('Urgent')),
    )

    # Informations de base
    notification_type = models.CharField(
        max_length=50,
        choices=NOTIFICATION_TYPES,
        verbose_name=_('Type de notification')
    )

    title = models.CharField(
        max_length=200,
        verbose_name=_('Titre')
    )

    message = models.TextField(
        verbose_name=_('Message')
    )

    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_LEVELS,
        default='medium',
        verbose_name=_('Priorité')
    )

    # Relations optionnelles
    related_driving_school_id = models.UUIDField(
        null=True,
        blank=True,
        verbose_name=_('Auto-école liée')
    )

    related_payment_id = models.UUIDField(
        null=True,
        blank=True,
        verbose_name=_('Paiement lié')
    )

    related_user_id = models.IntegerField(
        null=True,
        blank=True,
        verbose_name=_('Utilisateur lié')
    )

    # Statut
    is_read = models.BooleanField(
        default=False,
        verbose_name=_('Lu')
    )

    is_dismissed = models.BooleanField(
        default=False,
        verbose_name=_('Ignoré')
    )

    # Métadonnées
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('Date de création')
    )

    read_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('Date de lecture')
    )

    class Meta:
        db_table = 'admin_notifications'
        verbose_name = _('Notification admin')
        verbose_name_plural = _('Notifications admin')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.get_notification_type_display()})"

    def get_icon(self):
        """Retourne l'icône selon le type"""
        icons = {
            'driving_school_registration': 'BuildingOfficeIcon',
            'payment_received': 'CreditCardIcon',
            'upgrade_request': 'ArrowUpIcon',
            'contact_form': 'EnvelopeIcon',
            'system_alert': 'ExclamationTriangleIcon',
        }
        return icons.get(self.notification_type, 'BellIcon')

    def get_color_class(self):
        """Retourne la classe CSS selon la priorité"""
        colors = {
            'low': 'text-gray-500',
            'medium': 'text-blue-500',
            'high': 'text-orange-500',
            'urgent': 'text-red-500',
        }
        return colors.get(self.priority, 'text-blue-500')
