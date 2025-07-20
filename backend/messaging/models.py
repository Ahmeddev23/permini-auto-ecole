from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.utils import timezone


class Conversation(models.Model):
    """
    Modèle pour les conversations (disponible uniquement pour le plan Premium)
    """
    # Relations
    driving_school = models.ForeignKey(
        'driving_schools.DrivingSchool',
        on_delete=models.CASCADE,
        related_name='conversations',
        verbose_name=_('Auto-école')
    )

    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='conversations',
        verbose_name=_('Participants')
    )

    # Informations de la conversation
    title = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        verbose_name=_('Titre')
    )

    is_group = models.BooleanField(
        default=False,
        verbose_name=_('Conversation de groupe')
    )

    # Métadonnées
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('Date de création')
    )

    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_('Dernière mise à jour')
    )

    class Meta:
        verbose_name = _('Conversation')
        verbose_name_plural = _('Conversations')
        ordering = ['-updated_at']

    def __str__(self):
        if self.title:
            return self.title
        participants_names = [p.username for p in self.participants.all()[:2]]
        return f"Conversation: {', '.join(participants_names)}"

    @property
    def last_message(self):
        """Retourne le dernier message de la conversation"""
        return self.messages.first()

    def get_other_participant(self, user):
        """Retourne l'autre participant dans une conversation privée"""
        if not self.is_group:
            return self.participants.exclude(id=user.id).first()
        return None


class Message(models.Model):
    """
    Modèle pour les messages
    """
    MESSAGE_TYPES = (
        ('text', _('Texte')),
        ('file', _('Fichier')),
        ('image', _('Image')),
        ('system', _('Message système')),
    )

    # Relations
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='messages',
        verbose_name=_('Conversation')
    )

    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_messages',
        verbose_name=_('Expéditeur')
    )

    # Contenu du message
    message_type = models.CharField(
        max_length=10,
        choices=MESSAGE_TYPES,
        default='text',
        verbose_name=_('Type de message')
    )

    content = models.TextField(
        blank=True,
        null=True,
        verbose_name=_('Contenu')
    )

    file_attachment = models.FileField(
        upload_to='messages/files/',
        blank=True,
        null=True,
        verbose_name=_('Fichier joint')
    )

    # Statut du message
    is_read = models.BooleanField(
        default=False,
        verbose_name=_('Lu')
    )

    read_at = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name=_('Lu le')
    )

    # Métadonnées
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('Date d\'envoi')
    )

    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_('Date de modification')
    )

    class Meta:
        verbose_name = _('Message')
        verbose_name_plural = _('Messages')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.sender.username}: {self.content[:50]}..."

    def mark_as_read(self):
        """Marquer le message comme lu"""
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save()


class Notification(models.Model):
    """
    Modèle pour les notifications push
    """
    NOTIFICATION_TYPES = (
        ('schedule', _('Emploi du temps')),
        ('exam', _('Examen')),
        ('payment', _('Paiement')),
        ('message', _('Message')),
        ('system', _('Système')),
        ('reminder', _('Rappel')),
    )

    PRIORITY_LEVELS = (
        ('low', _('Faible')),
        ('normal', _('Normal')),
        ('high', _('Élevé')),
        ('urgent', _('Urgent')),
    )

    # Relations
    driving_school = models.ForeignKey(
        'driving_schools.DrivingSchool',
        on_delete=models.CASCADE,
        related_name='notifications',
        verbose_name=_('Auto-école')
    )

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
        verbose_name=_('Destinataire')
    )

    # Contenu de la notification
    notification_type = models.CharField(
        max_length=20,
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
        max_length=10,
        choices=PRIORITY_LEVELS,
        default='normal',
        verbose_name=_('Priorité')
    )

    # Liens et actions
    action_url = models.URLField(
        blank=True,
        null=True,
        verbose_name=_('URL d\'action')
    )

    # Statut
    is_read = models.BooleanField(
        default=False,
        verbose_name=_('Lu')
    )

    read_at = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name=_('Lu le')
    )

    is_sent = models.BooleanField(
        default=False,
        verbose_name=_('Envoyé')
    )

    sent_at = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name=_('Envoyé le')
    )

    # Métadonnées
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('Date de création')
    )

    class Meta:
        verbose_name = _('Notification')
        verbose_name_plural = _('Notifications')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.recipient.username}: {self.title}"

    def mark_as_read(self):
        """Marquer la notification comme lue"""
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save()

    def mark_as_sent(self):
        """Marquer la notification comme envoyée"""
        if not self.is_sent:
            self.is_sent = True
            self.sent_at = timezone.now()
            self.save()


class DirectMessage(models.Model):
    """Modèle pour les messages directs (style Messenger)"""
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_direct_messages',
        verbose_name=_('Expéditeur')
    )
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='received_direct_messages',
        verbose_name=_('Destinataire')
    )
    content = models.TextField(verbose_name=_('Contenu'))
    is_read = models.BooleanField(default=False, verbose_name=_('Lu'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Créé le'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Modifié le'))

    class Meta:
        ordering = ['created_at']
        verbose_name = _('Message direct')
        verbose_name_plural = _('Messages directs')
        indexes = [
            models.Index(fields=['sender', 'recipient', '-created_at']),
            models.Index(fields=['recipient', 'is_read']),
        ]

    def __str__(self):
        return f"Message direct de {self.sender.username} à {self.recipient.username}"
