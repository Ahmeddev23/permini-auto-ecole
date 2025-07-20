from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from .models import Payment, SubscriptionPayment


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer pour les paiements"""
    driving_school_name = serializers.CharField(source='driving_school.name', read_only=True)
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    is_overdue = serializers.ReadOnlyField()
    
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ('created_at',)


class PaymentCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer un paiement"""
    
    class Meta:
        model = Payment
        fields = ('id', 'student', 'amount', 'payment_type', 'due_date', 'description')
        read_only_fields = ('id',)
    
    def create(self, validated_data):
        # Associer l'auto-école de l'utilisateur connecté
        user = self.context['request'].user
        if hasattr(user, 'driving_school'):
            validated_data['driving_school'] = user.driving_school

        # Créer le paiement
        payment = super().create(validated_data)
        print(f"🔔 Paiement créé dans le serializer: {payment.id}")

        # Envoyer une notification à l'étudiant
        self._send_payment_notification(payment)

        return payment

    def _send_payment_notification(self, payment):
        """Envoyer une notification à l'étudiant quand un paiement est ajouté"""
        print(f"🔔 _send_payment_notification appelée pour le paiement {payment.id}")
        try:
            # Import local pour éviter les imports circulaires
            from notifications.models import Notification
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync

            if payment.student and hasattr(payment.student, 'user'):
                student_user = payment.student.user
                due_date = payment.due_date.strftime('%d/%m/%Y')

                notification = Notification.objects.create(
                    recipient=student_user,
                    notification_type='payment_reminder',
                    title='Nouveau paiement à effectuer',
                    message=f'Un paiement de {payment.amount}DT est à effectuer avant le {due_date}. Description: {payment.description}',
                    priority='medium',
                    related_payment_id=payment.id
                )

                # Envoyer via WebSocket
                channel_layer = get_channel_layer()
                if channel_layer:
                    async_to_sync(channel_layer.group_send)(
                        f"user_{student_user.id}",
                        {
                            'type': 'notification_created',
                            'notification': {
                                'id': notification.id,
                                'type': notification.notification_type,
                                'title': notification.title,
                                'message': notification.message,
                                'priority': notification.priority,
                                'icon': notification.get_icon(),
                                'created_at': notification.created_at.isoformat(),
                            }
                        }
                    )

                print(f"📨 Notification de paiement envoyée à l'étudiant {student_user.username}")
            else:
                print(f"❌ Étudiant non trouvé ou sans utilisateur associé")

        except Exception as e:
            print(f"❌ Erreur lors de l'envoi de la notification de paiement: {e}")
            import traceback
            traceback.print_exc()


class PaymentUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour mettre à jour un paiement"""
    
    class Meta:
        model = Payment
        fields = ('amount', 'payment_type', 'due_date', 'description', 'status', 
                 'payment_date', 'payment_method', 'transaction_id', 'notes')


class PaymentListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour la liste des paiements"""
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    student_id = serializers.IntegerField(source='student.id', read_only=True)
    is_overdue = serializers.ReadOnlyField()

    class Meta:
        model = Payment
        fields = ('id', 'student_id', 'student_name', 'amount', 'payment_type', 'due_date',
                 'status', 'is_overdue', 'payment_date', 'session_count')


class SubscriptionPaymentSerializer(serializers.ModelSerializer):
    """Serializer pour les paiements d'abonnement"""
    driving_school_name = serializers.CharField(source='driving_school.name', read_only=True)
    
    class Meta:
        model = SubscriptionPayment
        fields = '__all__'
        read_only_fields = ('created_at',)


class SubscriptionPaymentCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer un paiement d'abonnement"""
    
    class Meta:
        model = SubscriptionPayment
        fields = ('plan_type', 'amount', 'billing_period')
    
    def create(self, validated_data):
        # Associer l'auto-école de l'utilisateur connecté
        user = self.context['request'].user
        if hasattr(user, 'owned_driving_school'):
            validated_data['driving_school'] = user.owned_driving_school
        return super().create(validated_data)


class PaymentStatsSerializer(serializers.Serializer):
    """Serializer pour les statistiques de paiements"""
    total_revenue = serializers.DecimalField(max_digits=10, decimal_places=2)
    monthly_revenue = serializers.DecimalField(max_digits=10, decimal_places=2)
    pending_payments = serializers.DecimalField(max_digits=10, decimal_places=2)
    overdue_payments = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_payments = serializers.IntegerField()
    paid_payments = serializers.IntegerField()
    pending_count = serializers.IntegerField()
    overdue_count = serializers.IntegerField()
    collection_rate = serializers.FloatField()


class PaymentMethodStatsSerializer(serializers.Serializer):
    """Serializer pour les statistiques par méthode de paiement"""
    cash_total = serializers.DecimalField(max_digits=10, decimal_places=2)
    card_total = serializers.DecimalField(max_digits=10, decimal_places=2)
    bank_transfer_total = serializers.DecimalField(max_digits=10, decimal_places=2)
    check_total = serializers.DecimalField(max_digits=10, decimal_places=2)
