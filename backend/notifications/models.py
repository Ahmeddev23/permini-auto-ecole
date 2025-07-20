from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.conf import settings

User = get_user_model()

class Notification(models.Model):
    NOTIFICATION_TYPES = [
        # Driving School notifications
        ('new_student', 'Nouveau étudiant inscrit'),
        ('instructor_update', 'Mise à jour moniteur'),
        ('vehicle_issue', 'Problème véhicule'),
        ('vehicle_expense', 'Dépense véhicule'),
        ('payment_received', 'Paiement reçu'),
        ('payment_overdue', 'Paiement en retard'),
        ('subscription_expiry', 'Expiration abonnement'),
        ('vehicle_expiry', 'Expiration véhicule'),
        ('support_response', 'Réponse support'),
        
        # Instructor notifications
        ('session_assigned', 'Nouvelle séance assignée'),
        ('schedule_change', 'Changement d\'horaire'),
        ('student_progress', 'Progrès étudiant'),
        ('session_cancelled', 'Séance annulée'),
        
        # Student notifications
        ('lesson_confirmed', 'Leçon confirmée'),
        ('lesson_reminder', 'Rappel de leçon'),
        ('schedule_updated', 'Horaire mis à jour'),
        ('exam_result', 'Résultat d\'examen'),
        ('exam_reminder', 'Rappel d\'examen'),
        ('payment_reminder', 'Rappel de paiement'),
        ('payment_confirmed', 'Paiement confirmé'),
        ('exam_added', 'Nouvel examen'),
    ]
    
    PRIORITY_LEVELS = [
        ('low', 'Faible'),
        ('medium', 'Moyenne'),
        ('high', 'Élevée'),
        ('urgent', 'Urgente'),
    ]

    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='user_notifications')
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    priority = models.CharField(max_length=10, choices=PRIORITY_LEVELS, default='medium')
    
    # Metadata for context
    related_student_id = models.IntegerField(null=True, blank=True)
    related_instructor_id = models.IntegerField(null=True, blank=True)
    related_session_id = models.IntegerField(null=True, blank=True)
    related_vehicle_id = models.IntegerField(null=True, blank=True)
    related_payment_id = models.IntegerField(null=True, blank=True)
    
    # Status
    is_read = models.BooleanField(default=False)
    is_dismissed = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now)
    read_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'is_read']),
            models.Index(fields=['recipient', 'created_at']),
            models.Index(fields=['notification_type']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.recipient.username}"
    
    def mark_as_read(self):
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save()
    
    def get_icon(self):
        """Return appropriate icon for notification type"""
        icon_map = {
            'new_student': '👨‍🎓',
            'instructor_update': '👨‍🏫',
            'vehicle_issue': '🚗',
            'vehicle_expense': '💸',
            'payment_received': '💰',
            'payment_overdue': '⚠️',
            'subscription_expiry': '📅',
            'vehicle_expiry': '🚗',
            'session_assigned': '📅',
            'schedule_change': '🔄',
            'student_progress': '📈',
            'session_cancelled': '❌',
            'lesson_confirmed': '✅',
            'lesson_reminder': '⏰',
            'schedule_updated': '📅',
            'exam_result': '📋',
            'exam_reminder': '⏰',
            'payment_reminder': '💳',
            'payment_confirmed': '✅',
            'exam_added': '📝',
        }
        return icon_map.get(self.notification_type, '📢')
    
    def get_color_class(self):
        """Return CSS color class based on priority"""
        color_map = {
            'low': 'text-gray-500',
            'medium': 'text-blue-500',
            'high': 'text-orange-500',
            'urgent': 'text-red-500',
        }
        return color_map.get(self.priority, 'text-blue-500')
