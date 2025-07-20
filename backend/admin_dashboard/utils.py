from django.utils import timezone
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import AdminNotification


def send_admin_notification(
    notification_type,
    title,
    message,
    priority='medium',
    related_driving_school_id=None,
    related_payment_id=None,
    related_user_id=None
):
    """
    Envoie une notification aux admins via WebSocket et sauvegarde en base
    """
    try:
        # Créer la notification en base
        notification = AdminNotification.objects.create(
            notification_type=notification_type,
            title=title,
            message=message,
            priority=priority,
            related_driving_school_id=related_driving_school_id,
            related_payment_id=related_payment_id,
            related_user_id=related_user_id
        )

        # Envoyer via WebSocket à tous les admins connectés
        channel_layer = get_channel_layer()
        if channel_layer:
            async_to_sync(channel_layer.group_send)(
                "admin_notifications",
                {
                    'type': 'admin_notification',
                    'notification': {
                        'id': notification.id,
                        'type': notification.notification_type,
                        'title': notification.title,
                        'message': notification.message,
                        'priority': notification.priority,
                        'icon': notification.get_icon(),
                        'color_class': notification.get_color_class(),
                        'created_at': notification.created_at.isoformat(),
                        'related_driving_school_id': str(related_driving_school_id) if related_driving_school_id else None,
                        'related_payment_id': str(related_payment_id) if related_payment_id else None,
                        'related_user_id': related_user_id,
                    }
                }
            )

        print(f"📨 Notification admin envoyée: {title}")
        return notification

    except Exception as e:
        print(f"❌ Erreur lors de l'envoi de la notification admin: {e}")
        import traceback
        traceback.print_exc()
        return None


def notify_driving_school_registration(driving_school):
    """Notifier l'inscription d'une nouvelle auto-école"""
    return send_admin_notification(
        notification_type='driving_school_registration',
        title='Nouvelle inscription auto-école',
        message=f'L\'auto-école "{driving_school.name}" vient de s\'inscrire.',
        priority='medium',
        related_driving_school_id=driving_school.id,
        related_user_id=driving_school.owner.id if driving_school.owner else None
    )


def notify_payment_received(payment, driving_school):
    """Notifier la réception d'un paiement"""
    return send_admin_notification(
        notification_type='payment_received',
        title='Nouveau paiement reçu',
        message=f'Paiement de {payment.amount} TND reçu de "{driving_school.name}" pour le plan {payment.plan}.',
        priority='medium',
        related_payment_id=payment.id,
        related_driving_school_id=driving_school.id,
        related_user_id=driving_school.owner.id if driving_school.owner else None
    )


def notify_support_request(contact_form, driving_school, user, priority_label):
    """Notifier une nouvelle demande de support"""
    # Déterminer la priorité de la notification selon la priorité de la demande
    notification_priority = 'medium'  # Par défaut
    if contact_form.priority == 'urgent':
        notification_priority = 'urgent'
    elif contact_form.priority == 'high':
        notification_priority = 'high'
    elif contact_form.priority == 'low':
        notification_priority = 'low'

    return send_admin_notification(
        notification_type='contact_form',
        title=f'Nouvelle demande de support - {driving_school.name}',
        message=f'Demande de support de priorité {priority_label} reçue de "{driving_school.name}". '
                f'Sujet: {contact_form.subject.replace("[SUPPORT AUTO-ÉCOLE] ", "")}',
        priority=notification_priority,
        related_driving_school_id=driving_school.id,
        related_user_id=user.id
    )


def notify_upgrade_request(upgrade_request):
    """Notifier une demande de mise à niveau"""
    return send_admin_notification(
        notification_type='upgrade_request',
        title='Nouvelle demande de mise à niveau',
        message=f'"{upgrade_request.driving_school.name}" demande une mise à niveau vers le plan {upgrade_request.requested_plan} ({upgrade_request.amount} TND).',
        priority='high',
        related_driving_school_id=upgrade_request.driving_school.id,
        related_user_id=upgrade_request.driving_school.owner.id if upgrade_request.driving_school.owner else None
    )


def notify_contact_form(contact_form):
    """Notifier un nouveau formulaire de contact"""
    return send_admin_notification(
        notification_type='contact_form',
        title='Nouveau formulaire de contact',
        message=f'Nouveau message de {contact_form.name} ({contact_form.email}): {contact_form.subject}',
        priority='medium',
        related_user_id=None
    )
