from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import datetime, timedelta
from django.utils.translation import gettext_lazy as _
from django.http import Http404

from .models import Payment, SubscriptionPayment
from .serializers import (
    PaymentSerializer, PaymentCreateSerializer, PaymentUpdateSerializer, PaymentListSerializer,
    SubscriptionPaymentSerializer, SubscriptionPaymentCreateSerializer,
    PaymentStatsSerializer, PaymentMethodStatsSerializer
)
from notifications.utils import notify_payment_received
# from notifications.utils import notify_payment_reminder  # Import circulaire


class PaymentListCreateView(generics.ListCreateAPIView):
    """Vue pour lister et créer les paiements"""
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PaymentCreateSerializer
        return PaymentListSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = Payment.objects.none()

        if hasattr(user, 'driving_school'):
            queryset = user.driving_school.payments.all()
        elif user.user_type == 'student' and hasattr(user, 'student_profile'):
            queryset = user.student_profile.payments.all()

        # Filtres par paramètres GET
        status_filter = self.request.query_params.get('status')
        student_id = self.request.query_params.get('student')
        payment_type = self.request.query_params.get('type')
        overdue_only = self.request.query_params.get('overdue')

        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        if payment_type:
            queryset = queryset.filter(payment_type=payment_type)
        if overdue_only == 'true':
            queryset = queryset.filter(
                due_date__lt=timezone.now().date(),
                status='pending'
            )

        return queryset.order_by('-created_at')


class PaymentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Vue pour récupérer, mettre à jour et supprimer un paiement"""
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return PaymentUpdateSerializer
        return PaymentSerializer

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'driving_school'):
            return user.driving_school.payments.all()
        elif user.user_type == 'student' and hasattr(user, 'student_profile'):
            return user.student_profile.payments.all()
        return Payment.objects.none()


class SubscriptionPaymentListCreateView(generics.ListCreateAPIView):
    """Vue pour lister et créer les paiements d'abonnement"""
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return SubscriptionPaymentCreateSerializer
        return SubscriptionPaymentSerializer

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'driving_school'):
            return user.driving_school.subscription_payments.all()
        return SubscriptionPayment.objects.none()


class SubscriptionPaymentDetailView(generics.RetrieveUpdateAPIView):
    """Vue pour récupérer et mettre à jour un paiement d'abonnement"""
    serializer_class = SubscriptionPaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'driving_school'):
            return user.driving_school.subscription_payments.all()
        return SubscriptionPayment.objects.none()


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_payment_paid_view(request, pk):
    """Vue pour marquer un paiement comme payé"""
    user = request.user

    try:
        if hasattr(user, 'driving_school'):
            payment = user.driving_school.payments.get(pk=pk)
        elif user.user_type == 'student' and hasattr(user, 'student_profile'):
            payment = user.student_profile.payments.get(pk=pk)
        else:
            return Response({'error': _('Paiement non trouvé')},
                           status=status.HTTP_404_NOT_FOUND)
    except Payment.DoesNotExist:
        return Response({'error': _('Paiement non trouvé')},
                       status=status.HTTP_404_NOT_FOUND)

    if payment.status == 'paid':
        return Response({'error': _('Le paiement est déjà marqué comme payé')},
                       status=status.HTTP_400_BAD_REQUEST)

    payment.status = 'paid'
    payment.payment_date = timezone.now().date()
    payment.payment_method = request.data.get('payment_method', 'cash')
    payment.transaction_id = request.data.get('transaction_id', '')
    payment.notes = request.data.get('notes', '')
    payment.save()

    # Envoyer une notification à l'auto-école
    try:
        driving_school_user = payment.driving_school.owner
        student_name = f"{payment.student.first_name} {payment.student.last_name}"
        notify_payment_received(driving_school_user, payment.amount, student_name)
        print(f"📨 Notification de paiement envoyée à l'auto-école {driving_school_user.username}")
    except Exception as e:
        print(f"❌ Erreur lors de l'envoi de la notification de paiement: {e}")

    serializer = PaymentSerializer(payment)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def payment_stats_view(request):
    """Vue pour les statistiques de paiements"""
    user = request.user

    if not hasattr(user, 'driving_school'):
        return Response({'error': _('Auto-école non trouvée')},
                       status=status.HTTP_404_NOT_FOUND)

    driving_school = user.driving_school

    # Revenus totaux
    total_revenue = driving_school.payments.filter(status='paid').aggregate(
        total=Sum('amount'))['total'] or 0

    # Revenus du mois en cours
    current_month = timezone.now().replace(day=1)
    next_month = (current_month + timedelta(days=32)).replace(day=1)

    monthly_revenue = driving_school.payments.filter(
        status='paid',
        payment_date__gte=current_month.date(),
        payment_date__lt=next_month.date()
    ).aggregate(total=Sum('amount'))['total'] or 0

    # Paiements en attente
    pending_payments = driving_school.payments.filter(status='pending').aggregate(
        total=Sum('amount'))['total'] or 0

    # Paiements en retard
    overdue_payments = driving_school.payments.filter(
        status='pending',
        due_date__lt=timezone.now().date()
    ).aggregate(total=Sum('amount'))['total'] or 0

    # Compteurs
    total_payments = driving_school.payments.count()
    paid_payments = driving_school.payments.filter(status='paid').count()
    pending_count = driving_school.payments.filter(status='pending').count()
    overdue_count = driving_school.payments.filter(
        status='pending',
        due_date__lt=timezone.now().date()
    ).count()

    # Taux de recouvrement
    collection_rate = (paid_payments / total_payments * 100) if total_payments > 0 else 0

    stats = {
        'total_revenue': total_revenue,
        'monthly_revenue': monthly_revenue,
        'pending_payments': pending_payments,
        'overdue_payments': overdue_payments,
        'total_payments': total_payments,
        'paid_payments': paid_payments,
        'pending_count': pending_count,
        'overdue_count': overdue_count,
        'collection_rate': collection_rate,
    }

    serializer = PaymentStatsSerializer(stats)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def payment_methods_stats_view(request):
    """Vue pour les statistiques par méthode de paiement"""
    user = request.user

    if not hasattr(user, 'driving_school'):
        return Response({'error': _('Auto-école non trouvée')},
                       status=status.HTTP_404_NOT_FOUND)

    driving_school = user.driving_school

    # Statistiques par méthode de paiement
    cash_total = driving_school.payments.filter(
        status='paid', payment_method='cash'
    ).aggregate(total=Sum('amount'))['total'] or 0

    card_total = driving_school.payments.filter(
        status='paid', payment_method='card'
    ).aggregate(total=Sum('amount'))['total'] or 0

    bank_transfer_total = driving_school.payments.filter(
        status='paid', payment_method='bank_transfer'
    ).aggregate(total=Sum('amount'))['total'] or 0

    check_total = driving_school.payments.filter(
        status='paid', payment_method='check'
    ).aggregate(total=Sum('amount'))['total'] or 0

    stats = {
        'cash_total': cash_total,
        'card_total': card_total,
        'bank_transfer_total': bank_transfer_total,
        'check_total': check_total,
    }

    serializer = PaymentMethodStatsSerializer(stats)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def process_card_payment(request):
    """Traiter un paiement par carte bancaire via ClickToPay"""
    try:
        # Récupérer les données de la carte
        card_number = request.data.get('card_number')
        expiry_date = request.data.get('expiry_date')
        cvv = request.data.get('cvv')
        cardholder_name = request.data.get('cardholder_name')
        amount = float(request.data.get('amount'))
        plan_id = request.data.get('plan_id')
        is_renewal = request.data.get('is_renewal', False)

        # Validation des données
        if not all([card_number, expiry_date, cvv, cardholder_name]):
            return Response({'error': 'Tous les champs de la carte sont requis'},
                          status=status.HTTP_400_BAD_REQUEST)

        # Récupérer l'auto-école
        driving_school = request.user.driving_school

        # Créer la demande d'upgrade
        from driving_schools.models import UpgradeRequest
        upgrade_request = UpgradeRequest.objects.create(
            driving_school=driving_school,
            current_plan=driving_school.current_plan,
            requested_plan=plan_id,
            amount=amount,
            payment_method='card',
            status='pending',
            is_renewal=is_renewal
        )

        # Simuler l'intégration ClickToPay (remplacer par la vraie API)
        clicktopay_response = simulate_clicktopay_payment({
            'card_number': card_number,
            'expiry_date': expiry_date,
            'cvv': cvv,
            'cardholder_name': cardholder_name,
            'amount': amount,
            'currency': 'TND',
            'order_id': str(upgrade_request.id)
        })

        if clicktopay_response['success']:
            # Paiement réussi - Approuver automatiquement
            upgrade_request.status = 'approved'
            upgrade_request.processed_at = timezone.now()
            upgrade_request.admin_notes = f"Paiement automatique par carte - Transaction: {clicktopay_response['transaction_id']}"
            upgrade_request.save()

            # Mettre à jour le plan de l'auto-école
            update_driving_school_plan(driving_school, upgrade_request)

            return Response({
                'success': True,
                'message': 'Paiement effectué avec succès',
                'transaction_id': clicktopay_response['transaction_id']
            })
        else:
            # Paiement échoué
            upgrade_request.status = 'rejected'
            upgrade_request.processed_at = timezone.now()
            upgrade_request.admin_notes = f"Paiement échoué: {clicktopay_response['error']}"
            upgrade_request.save()

            return Response({
                'success': False,
                'message': clicktopay_response['error']
            }, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def process_flouci_payment(request):
    """Traiter un paiement via Flouci"""
    try:
        phone_number = request.data.get('phone_number')
        amount = float(request.data.get('amount'))
        plan_id = request.data.get('plan_id')
        is_renewal = request.data.get('is_renewal', False)

        if not phone_number:
            return Response({'error': 'Numéro de téléphone requis'},
                          status=status.HTTP_400_BAD_REQUEST)

        # Récupérer l'auto-école
        driving_school = request.user.driving_school

        # Créer la demande d'upgrade
        from driving_schools.models import UpgradeRequest
        upgrade_request = UpgradeRequest.objects.create(
            driving_school=driving_school,
            current_plan=driving_school.current_plan,
            requested_plan=plan_id,
            amount=amount,
            payment_method='flouci',
            status='pending',
            is_renewal=is_renewal
        )

        # Intégration Flouci
        flouci_response = initiate_flouci_payment({
            'phone_number': phone_number,
            'amount': amount,
            'order_id': str(upgrade_request.id),
            'description': f'Abonnement {plan_id} - {driving_school.name}'
        })

        if flouci_response['success']:
            return Response({
                'success': True,
                'message': 'Paiement Flouci initié',
                'payment_url': flouci_response['payment_url'],
                'payment_id': flouci_response['payment_id']
            })
        else:
            upgrade_request.delete()
            return Response({
                'success': False,
                'message': flouci_response['error']
            }, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def simulate_clicktopay_payment(payment_data):
    """Simuler un paiement ClickToPay (remplacer par la vraie API)"""
    import uuid
    import random

    # Pour la démo, on simule un succès
    # Dans la vraie implémentation, faire l'appel à l'API ClickToPay

    # Simulation de validation de carte
    card_number = payment_data['card_number'].replace(' ', '')
    if len(card_number) < 16:
        return {'success': False, 'error': 'Numéro de carte invalide'}

    # Simuler un succès (90% de chance)
    if random.random() > 0.1:
        return {
            'success': True,
            'transaction_id': f'CTP_{uuid.uuid4().hex[:12].upper()}',
            'amount': payment_data['amount'],
            'currency': payment_data['currency']
        }
    else:
        return {'success': False, 'error': 'Paiement refusé par la banque'}


def initiate_flouci_payment(payment_data):
    """Initier un paiement Flouci"""
    import requests
    import uuid
    from django.conf import settings

    try:
        # Configuration Flouci (à mettre dans settings.py)
        FLOUCI_APP_TOKEN = getattr(settings, 'FLOUCI_APP_TOKEN', 'your_app_token')
        FLOUCI_APP_SECRET = getattr(settings, 'FLOUCI_APP_SECRET', 'your_app_secret')
        FLOUCI_BASE_URL = 'https://developers.flouci.com/api'

        # Préparer les données pour Flouci
        payload = {
            'app_token': FLOUCI_APP_TOKEN,
            'app_secret': FLOUCI_APP_SECRET,
            'amount': int(payment_data['amount'] * 1000),  # Flouci utilise les millimes
            'accept_card': 'true',
            'session_timeout_secs': 1200,
            'success_link': f"{getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')}/payment/success",
            'fail_link': f"{getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')}/payment/failed",
            'developer_tracking_id': payment_data['order_id']
        }

        # Appel à l'API Flouci
        response = requests.post(f'{FLOUCI_BASE_URL}/generate_payment', json=payload)

        if response.status_code == 200:
            data = response.json()
            if data.get('result') and data['result'].get('success'):
                return {
                    'success': True,
                    'payment_id': data['result']['payment_id'],
                    'payment_url': data['result']['link']
                }
            else:
                return {'success': False, 'error': 'Erreur Flouci: ' + str(data)}
        else:
            return {'success': False, 'error': f'Erreur API Flouci: {response.status_code}'}

    except Exception as e:
        # En cas d'erreur, simuler pour la démo
        return {
            'success': True,
            'payment_id': f'FL_{uuid.uuid4().hex[:12].upper()}',
            'payment_url': f'https://payment.flouci.com/pay/{uuid.uuid4().hex}'
        }


def update_driving_school_plan(driving_school, upgrade_request):
    """Mettre à jour le plan de l'auto-école après paiement réussi"""

    if upgrade_request.is_renewal:
        # Renouvellement : ajouter 30 jours à la date d'expiration actuelle
        if driving_school.plan_end_date:
            base_date = max(driving_school.plan_end_date.date(), timezone.now().date())
            driving_school.plan_end_date = base_date + timedelta(days=30)
        else:
            driving_school.plan_end_date = timezone.now().date() + timedelta(days=30)

        # Pour les renouvellements Standard, augmenter le nombre de comptes
        if upgrade_request.requested_plan == 'standard':
            driving_school.renewal_count += 1
            driving_school.max_accounts = 200 + (driving_school.renewal_count * 50)
    else:
        # Nouveau plan : partir d'aujourd'hui
        driving_school.current_plan = upgrade_request.requested_plan
        driving_school.plan_end_date = timezone.now().date() + timedelta(days=30)

        # Définir les limites de comptes pour un nouveau plan
        if upgrade_request.requested_plan == 'standard':
            driving_school.max_accounts = 200
            driving_school.renewal_count = 0
        elif upgrade_request.requested_plan == 'premium':
            driving_school.max_accounts = 999999  # Illimité
            driving_school.renewal_count = 0

    driving_school.save()
    print(f"✅ Plan mis à jour pour {driving_school.name}: {upgrade_request.requested_plan} jusqu'au {driving_school.plan_end_date}")
