from rest_framework import generics, permissions, status, serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Count, Sum
from django.utils import timezone
from datetime import datetime, timedelta
from django.utils.translation import gettext_lazy as _
from django.http import Http404

from .models import DrivingSchool, Expense, Revenue
from .serializers import (
    DrivingSchoolSerializer, DrivingSchoolCreateSerializer,
    DrivingSchoolUpdateSerializer, ExpenseSerializer, RevenueSerializer,
    DashboardStatsSerializer, SubscriptionSerializer
)


class DrivingSchoolCreateView(generics.CreateAPIView):
    """Vue pour créer une auto-école"""
    serializer_class = DrivingSchoolCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Vérifier que l'utilisateur n'a pas déjà une auto-école
        if hasattr(self.request.user, 'driving_school'):
            raise serializers.ValidationError(_("Vous avez déjà une auto-école"))

        # Changer le type d'utilisateur
        user = self.request.user
        user.user_type = 'driving_school'
        user.save()

        serializer.save()


class DrivingSchoolDetailView(generics.RetrieveUpdateAPIView):
    """Vue pour récupérer et mettre à jour une auto-école"""
    serializer_class = DrivingSchoolSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        # Retourner l'auto-école de l'utilisateur connecté
        if hasattr(self.request.user, 'driving_school'):
            return self.request.user.driving_school
        raise Http404(_("Auto-école non trouvée"))

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return DrivingSchoolUpdateSerializer
        return DrivingSchoolSerializer


class ExpenseListCreateView(generics.ListCreateAPIView):
    """Vue pour lister et créer les dépenses"""
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Déterminer l'auto-école selon le type d'utilisateur
        driving_school = None
        if hasattr(user, 'driving_school'):
            driving_school = user.driving_school
        elif user.user_type == 'instructor' and hasattr(user, 'instructor_profile'):
            driving_school = user.instructor_profile.driving_school

        if not driving_school:
            return Expense.objects.none()

        # Vérifier que l'auto-école a un plan Premium
        if driving_school.current_plan != 'premium':
            return Expense.objects.none()

        return driving_school.expenses.all()

    def perform_create(self, serializer):
        """Personnaliser la création - seules les auto-écoles peuvent créer des dépenses"""
        user = self.request.user
        if user.user_type == 'instructor':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Les moniteurs ne peuvent que consulter les dépenses")

        # Déterminer l'auto-école
        driving_school = None
        if hasattr(user, 'driving_school'):
            driving_school = user.driving_school

        if driving_school:
            serializer.save(driving_school=driving_school)


class ExpenseDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Vue pour récupérer, mettre à jour et supprimer une dépense"""
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Déterminer l'auto-école selon le type d'utilisateur
        driving_school = None
        if hasattr(user, 'driving_school'):
            driving_school = user.driving_school
        elif user.user_type == 'instructor' and hasattr(user, 'instructor_profile'):
            driving_school = user.instructor_profile.driving_school

        if not driving_school:
            return Expense.objects.none()

        return driving_school.expenses.all()


class RevenueListCreateView(generics.ListCreateAPIView):
    """Vue pour lister et créer les revenus"""
    serializer_class = RevenueSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Déterminer l'auto-école selon le type d'utilisateur
        driving_school = None
        if hasattr(user, 'driving_school'):
            driving_school = user.driving_school
        elif user.user_type == 'instructor' and hasattr(user, 'instructor_profile'):
            driving_school = user.instructor_profile.driving_school

        if not driving_school:
            return Revenue.objects.none()

        # Vérifier que l'auto-école a un plan Premium
        if driving_school.current_plan != 'premium':
            return Revenue.objects.none()

        return driving_school.revenues.all()

    def perform_create(self, serializer):
        """Personnaliser la création - seules les auto-écoles peuvent créer des revenus"""
        user = self.request.user
        if user.user_type == 'instructor':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Les moniteurs ne peuvent que consulter les revenus")

        # Déterminer l'auto-école
        driving_school = None
        if hasattr(user, 'driving_school'):
            driving_school = user.driving_school

        if driving_school:
            serializer.save(driving_school=driving_school)


class RevenueDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Vue pour récupérer, mettre à jour et supprimer un revenu"""
    serializer_class = RevenueSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Déterminer l'auto-école selon le type d'utilisateur
        driving_school = None
        if hasattr(user, 'driving_school'):
            driving_school = user.driving_school
        elif user.user_type == 'instructor' and hasattr(user, 'instructor_profile'):
            driving_school = user.instructor_profile.driving_school

        if not driving_school:
            return Revenue.objects.none()

        return driving_school.revenues.all()


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_stats_view(request):
    """Vue pour les statistiques du tableau de bord"""
    user = request.user
    if not hasattr(user, 'driving_school'):
        return Response({'error': _('Auto-école non trouvée')},
                       status=status.HTTP_404_NOT_FOUND)

    driving_school = user.driving_school

    # Calculer les statistiques
    total_students = driving_school.students.count()
    active_students = driving_school.students.filter(is_active=True).count()
    total_instructors = driving_school.instructors.count()
    total_vehicles = driving_school.vehicles.count()

    # Statistiques du mois en cours
    current_month = timezone.now().replace(day=1)
    next_month = (current_month + timedelta(days=32)).replace(day=1)

    monthly_revenue = driving_school.revenues.filter(
        date__gte=current_month,
        date__lt=next_month
    ).aggregate(total=Sum('amount'))['total'] or 0

    monthly_expenses = driving_school.expenses.filter(
        date__gte=current_month,
        date__lt=next_month
    ).aggregate(total=Sum('amount'))['total'] or 0

    pending_payments = driving_school.payments.filter(status='pending').count()

    # Examens à venir (7 prochains jours)
    next_week = timezone.now() + timedelta(days=7)
    upcoming_exams = driving_school.exams.filter(
        exam_date__gte=timezone.now(),
        exam_date__lte=next_week
    ).count()

    stats = {
        'total_students': total_students,
        'active_students': active_students,
        'total_instructors': total_instructors,
        'total_vehicles': total_vehicles,
        'monthly_revenue': monthly_revenue,
        'monthly_expenses': monthly_expenses,
        'pending_payments': pending_payments,
        'upcoming_exams': upcoming_exams,
    }

    serializer = DashboardStatsSerializer(stats)
    return Response(serializer.data)


@api_view(['GET', 'PUT'])
@permission_classes([permissions.IsAuthenticated])
def driving_school_profile_view(request):
    """Vue pour récupérer et mettre à jour le profil de l'auto-école"""
    user = request.user
    if not hasattr(user, 'driving_school'):
        return Response({'error': _('Auto-école non trouvée')},
                       status=status.HTTP_404_NOT_FOUND)

    driving_school = user.driving_school

    if request.method == 'GET':
        # Récupérer le profil
        data = {
            'id': driving_school.id,
            'name': driving_school.name,
            'address': driving_school.address,
            'phone': driving_school.phone,
            'email': driving_school.email,
            'logo': request.build_absolute_uri(driving_school.logo.url) if driving_school.logo else None,
            'cin_document': request.build_absolute_uri(driving_school.cin_document.url) if driving_school.cin_document else None,
            'legal_documents': request.build_absolute_uri(driving_school.legal_documents.url) if driving_school.legal_documents else None,
            'theme_color': getattr(driving_school, 'theme_color', '#3B82F6'),
            'owner_name': f"{user.first_name} {user.last_name}".strip() or user.email,
        }
        return Response(data)

    elif request.method == 'PUT':
        # Mettre à jour le profil
        try:
            # Mettre à jour les champs texte
            if 'name' in request.data:
                driving_school.name = request.data['name']
            if 'address' in request.data:
                driving_school.address = request.data['address']
            if 'phone' in request.data:
                driving_school.phone = request.data['phone']
            if 'theme_color' in request.data:
                if hasattr(driving_school, 'theme_color'):
                    driving_school.theme_color = request.data['theme_color']

            # Mettre à jour les fichiers
            if 'logo' in request.FILES:
                driving_school.logo = request.FILES['logo']
            if 'cin_document' in request.FILES:
                driving_school.cin_document = request.FILES['cin_document']
            if 'legal_documents' in request.FILES:
                driving_school.legal_documents = request.FILES['legal_documents']

            driving_school.save()

            return Response({'message': _('Profil mis à jour avec succès')})

        except Exception as e:
            import traceback
            error_details = {
                'error': str(e),
                'traceback': traceback.format_exc(),
                'request_data': dict(request.data),
                'files': list(request.FILES.keys()) if request.FILES else []
            }
            return Response(error_details, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def subscription_info_view(request):
    """Vue pour les informations d'abonnement (avec support database plans)"""
    user = request.user
    if not hasattr(user, 'driving_school'):
        return Response({'error': _('Auto-école non trouvée')},
                       status=status.HTTP_404_NOT_FOUND)

    driving_school = user.driving_school

    # Utiliser le nouveau système de plans avec fallback vers l'ancien
    current_plan_obj = driving_school.get_current_plan()

    # Utiliser le nombre réel de comptes (calculé en temps réel)
    actual_accounts = driving_school.actual_current_accounts

    # Déterminer si l'upgrade est possible (pas Premium)
    current_plan_name = current_plan_obj.name if hasattr(current_plan_obj, 'name') else driving_school.current_plan
    can_upgrade = current_plan_name != 'premium'

    subscription_info = {
        'current_plan': current_plan_name,  # Maintenir compatibilité avec frontend
        'plan_start_date': driving_school.plan_start_date,
        'plan_end_date': driving_school.plan_end_date,
        'days_remaining': driving_school.days_remaining,
        'max_accounts': driving_school.get_max_accounts(),  # Utilise la nouvelle méthode avec renewals
        'current_accounts': actual_accounts,
        'can_upgrade': can_upgrade,
        # Nouvelles informations du plan (optionnelles pour compatibilité)
        'plan_details': {
            'display_name': current_plan_obj.display_name if hasattr(current_plan_obj, 'display_name') else current_plan_name.title(),
            'price': float(current_plan_obj.price) if hasattr(current_plan_obj, 'price') else (49.0 if current_plan_name == 'standard' else 99.0),
            'features': current_plan_obj.features if hasattr(current_plan_obj, 'features') else {}
        }
    }

    serializer = SubscriptionSerializer(subscription_info)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def upgrade_plan_view(request):
    """Vue pour mettre à niveau le plan d'abonnement (avec support database plans)"""
    user = request.user
    if not hasattr(user, 'driving_school'):
        return Response({'error': _('Auto-école non trouvée')},
                       status=status.HTTP_404_NOT_FOUND)

    driving_school = user.driving_school
    new_plan_name = request.data.get('plan')

    # Vérifier que le plan est valide (plus de plan 'free')
    valid_plans = ['standard', 'premium']
    if new_plan_name not in valid_plans:
        return Response({'error': _('Plan invalide')},
                       status=status.HTTP_400_BAD_REQUEST)

    # Utiliser uniquement le système legacy
    new_plan_obj = None

    # Vérifier que ce n'est pas une rétrogradation
    plan_hierarchy = {'free': 0, 'standard': 1, 'premium': 2}
    current_level = plan_hierarchy.get(driving_school.current_plan, 0)
    new_level = plan_hierarchy.get(new_plan, 0)

    if new_level <= current_level:
        return Response({'error': _('Vous ne pouvez que passer à un plan supérieur')},
                       status=status.HTTP_400_BAD_REQUEST)

    try:
        from datetime import timedelta
        from django.utils import timezone

        # Mettre à jour le plan (système legacy uniquement)
        driving_school.current_plan = new_plan_name

        driving_school.plan_start_date = timezone.now()

        # Définir les limites selon le plan (système legacy uniquement)
        if new_plan_name == 'standard':
            driving_school.max_accounts = 200
            duration_days = 30
            plan_price = 49.00  # Prix correct
        elif new_plan_name == 'premium':
            driving_school.max_accounts = 999999  # Illimité
            duration_days = 30
            plan_price = 99.00  # Prix correct

        driving_school.plan_end_date = driving_school.plan_start_date + timedelta(days=duration_days)
        driving_school.save()

        # Créer automatiquement une écriture comptable pour l'abonnement
        is_renewal = driving_school.renewal_count > 0
        create_subscription_accounting_entry(
            driving_school=driving_school,
            plan_type=new_plan_name,
            amount=plan_price,
            is_renewal=is_renewal
        )

        return Response({
            'message': _('Plan mis à niveau avec succès'),
            'new_plan': new_plan_name,
            'max_accounts': driving_school.get_max_accounts(),  # Utilise la nouvelle méthode
            'plan_end_date': driving_school.plan_end_date
        })

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def submit_upgrade_request_view(request):
    """Vue pour soumettre une demande de mise à niveau avec justificatif"""
    user = request.user
    if not hasattr(user, 'driving_school'):
        return Response({'error': _('Auto-école non trouvée')},
                       status=status.HTTP_404_NOT_FOUND)

    driving_school = user.driving_school

    # Vérifier qu'il n'y a pas déjà une demande en attente
    existing_request = driving_school.upgrade_requests.filter(status='pending').first()
    if existing_request:
        return Response({'error': _('Vous avez déjà une demande de mise à niveau en attente')},
                       status=status.HTTP_400_BAD_REQUEST)

    requested_plan = request.data.get('requested_plan')
    payment_method = request.data.get('payment_method')
    is_renewal = request.data.get('is_renewal', 'false').lower() == 'true'

    # Validation des données
    if not requested_plan or not payment_method:
        return Response({'error': _('Plan et méthode de paiement requis')},
                       status=status.HTTP_400_BAD_REQUEST)

    # Vérifier que le plan est valide
    valid_plans = ['standard', 'premium']
    if requested_plan not in valid_plans:
        return Response({'error': _('Plan invalide')},
                       status=status.HTTP_400_BAD_REQUEST)

    # Vérifier les restrictions selon le type de demande
    if is_renewal:
        # Pour un renouvellement, le plan doit être le même
        if requested_plan != driving_school.current_plan:
            return Response({'error': _('Le renouvellement doit être pour le même plan')},
                           status=status.HTTP_400_BAD_REQUEST)

        # Vérifier qu'on peut renouveler (dans les 5 derniers jours)
        if driving_school.days_remaining > 5:
            return Response({'error': _('Le renouvellement n\'est possible que dans les 5 derniers jours')},
                           status=status.HTTP_400_BAD_REQUEST)
    else:
        # Pour une mise à niveau, vérifier que ce n'est pas une rétrogradation
        plan_hierarchy = {'free': 0, 'standard': 1, 'premium': 2}
        current_level = plan_hierarchy.get(driving_school.current_plan, 0)
        new_level = plan_hierarchy.get(requested_plan, 0)

        if new_level <= current_level:
            return Response({'error': _('Vous ne pouvez que passer à un plan supérieur')},
                           status=status.HTTP_400_BAD_REQUEST)

        # Vérifier les restrictions de comptes pour la rétrogradation
        if driving_school.current_plan == 'premium' and requested_plan == 'standard':
            current_accounts = driving_school.actual_current_accounts
            if current_accounts > 200:
                return Response({'error': _(f'Impossible de rétrograder. Vous avez {current_accounts} comptes actifs (limite Standard: 200)')},
                               status=status.HTTP_400_BAD_REQUEST)

    try:
        from .models import UpgradeRequest, PaymentProof
        print(f"DEBUG: Données reçues: {request.data}")
        print(f"DEBUG: Fichiers reçus: {request.FILES}")

        # Utiliser les prix hardcodés (système legacy)
        plan_prices = {'standard': 49, 'premium': 99}
        original_amount = plan_prices.get(requested_plan, 0)

        # Gérer le coupon de réduction
        coupon_code = request.data.get('coupon_code')
        discount_percentage = request.data.get('discount_percentage')
        amount = original_amount

        if coupon_code and discount_percentage:
            try:
                discount_percentage = float(discount_percentage)
                discount = (original_amount * discount_percentage) / 100
                amount = original_amount - discount
                print(f"Coupon appliqué: {coupon_code}, réduction: {discount_percentage}%, montant final: {amount}")
            except (ValueError, TypeError):
                print(f"Erreur lors de l'application du coupon: {coupon_code}")
                # En cas d'erreur, utiliser le montant original
                amount = original_amount

        # Créer la demande de mise à niveau
        upgrade_request_data = {
            'driving_school': driving_school,
            'current_plan': driving_school.current_plan,
            'requested_plan': requested_plan,
            'payment_method': payment_method,
            'amount': amount,
            'is_renewal': is_renewal
        }

        # Ajouter les informations du coupon si présent
        if coupon_code:
            upgrade_request_data['admin_notes'] = f"Coupon appliqué: {coupon_code} ({discount_percentage}% de réduction). Montant original: {original_amount} TND"

            # Marquer le coupon comme utilisé
            try:
                from admin_dashboard.models import Coupon
                coupon = Coupon.objects.get(code=coupon_code.upper().strip())
                if coupon.can_be_used():
                    coupon.use_coupon()
                    print(f"Coupon {coupon_code} utilisé avec succès")
                else:
                    print(f"Attention: Coupon {coupon_code} ne peut plus être utilisé")
            except Coupon.DoesNotExist:
                print(f"Attention: Coupon {coupon_code} non trouvé")
            except Exception as e:
                print(f"Erreur lors de l'utilisation du coupon {coupon_code}: {e}")

        upgrade_request = UpgradeRequest.objects.create(**upgrade_request_data)

        # Notifier les admins de la nouvelle demande de paiement
        try:
            from admin_dashboard.utils import notify_upgrade_request
            notify_upgrade_request(upgrade_request)
        except Exception as e:
            print(f"❌ Erreur lors de l'envoi de la notification admin: {e}")

        # Créer le justificatif si un fichier est fourni
        receipt_file = request.FILES.get('receipt_file')
        transfer_reference = request.data.get('transfer_reference', '')
        transfer_date = request.data.get('transfer_date')

        if receipt_file:  # Si un justificatif est fourni, le créer
            PaymentProof.objects.create(
                upgrade_request=upgrade_request,
                receipt_file=receipt_file,
                transfer_reference=transfer_reference or '',
                transfer_date=transfer_date
            )

        return Response({
            'message': _('Demande de mise à niveau soumise avec succès'),
            'request_id': str(upgrade_request.id),
            'status': 'pending'
        })

    except Exception as e:
        import traceback
        print(f"ERREUR dans submit_upgrade_request_view: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_upgrade_requests_view(request):
    """Vue pour récupérer les demandes de mise à niveau de l'auto-école"""
    user = request.user
    if not hasattr(user, 'driving_school'):
        return Response({'error': _('Auto-école non trouvée')},
                       status=status.HTTP_404_NOT_FOUND)

    driving_school = user.driving_school

    try:
        from .models import UpgradeRequest

        requests = UpgradeRequest.objects.filter(
            driving_school=driving_school
        ).order_by('-created_at')

        requests_data = []
        for req in requests:
            request_data = {
                'id': str(req.id),
                'current_plan': req.current_plan,
                'requested_plan': req.requested_plan,
                'payment_method': req.payment_method,
                'amount': float(req.amount),
                'status': req.status,
                'created_at': req.created_at,
                'processed_at': req.processed_at,
                'admin_notes': req.admin_notes,
            }

            # Ajouter les infos du justificatif si disponible
            if hasattr(req, 'payment_proof'):
                proof = req.payment_proof
                request_data['payment_proof'] = {
                    'transfer_reference': proof.transfer_reference,
                    'transfer_date': proof.transfer_date,
                    'uploaded_at': proof.uploaded_at,
                }

            requests_data.append(request_data)

        return Response(requests_data)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'POST'])
@permission_classes([permissions.IsAuthenticated])
def vehicle_expenses_view(request):
    """Vue pour gérer les dépenses véhicules (Premium uniquement)"""
    user = request.user

    # Déterminer l'auto-école selon le type d'utilisateur
    driving_school = None
    if hasattr(user, 'driving_school'):
        driving_school = user.driving_school
    elif user.user_type == 'instructor' and hasattr(user, 'instructor_profile'):
        driving_school = user.instructor_profile.driving_school

    if not driving_school:
        return Response({'error': _('Auto-école non trouvée')},
                       status=status.HTTP_404_NOT_FOUND)

    # Vérifier que l'auto-école a un plan Premium
    if driving_school.current_plan != 'premium':
        return Response({'error': _('Fonctionnalité disponible uniquement pour le plan Premium')},
                       status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        try:
            from .models import VehicleExpense

            # Filtrer les dépenses selon le type d'utilisateur
            if user.user_type == 'instructor' and hasattr(user, 'instructor_profile'):
                # Pour les moniteurs : seulement les véhicules assignés
                expenses = VehicleExpense.objects.filter(
                    vehicle__in=user.instructor_profile.assigned_vehicles.all()
                ).select_related('vehicle').order_by('-date')
            else:
                # Pour les auto-écoles : tous les véhicules
                expenses = VehicleExpense.objects.filter(
                    driving_school=driving_school
                ).select_related('vehicle').order_by('-date')

            expenses_data = []
            for expense in expenses:
                expense_data = {
                    'id': str(expense.id),
                    'vehicle': {
                        'id': str(expense.vehicle.id),
                        'brand': expense.vehicle.brand,
                        'model': expense.vehicle.model,
                        'license_plate': expense.vehicle.license_plate,
                    },
                    'category': expense.category,
                    'description': expense.description,
                    'amount': float(expense.amount),
                    'date': expense.date.isoformat(),
                    'odometer_reading': expense.odometer_reading,
                    'notes': expense.notes,
                }

                if expense.receipt:
                    expense_data['receipt'] = expense.receipt.url

                expenses_data.append(expense_data)

            # Ajouter un flag pour indiquer si c'est un moniteur
            response_data = {
                'expenses': expenses_data,
                'is_instructor': user.user_type == 'instructor'
            }

            return Response(response_data)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    elif request.method == 'POST':
        try:
            from .models import VehicleExpense
            from vehicles.models import Vehicle

            # Récupérer les données du formulaire
            vehicle_id = request.data.get('vehicle_id')
            category = request.data.get('category')
            description = request.data.get('description')
            amount = request.data.get('amount')
            date = request.data.get('date')
            odometer_reading = request.data.get('odometer_reading')
            notes = request.data.get('notes', '')
            receipt = request.FILES.get('receipt')

            # Validation
            if not all([vehicle_id, category, description, amount, date]):
                return Response({'error': _('Tous les champs obligatoires doivent être remplis')},
                               status=status.HTTP_400_BAD_REQUEST)

            # Vérifier que le véhicule est accessible selon le type d'utilisateur
            try:
                if user.user_type == 'instructor' and hasattr(user, 'instructor_profile'):
                    # Pour les moniteurs : vérifier que le véhicule leur est assigné
                    vehicle = user.instructor_profile.assigned_vehicles.get(id=vehicle_id)
                else:
                    # Pour les auto-écoles : vérifier que le véhicule appartient à l'auto-école
                    vehicle = Vehicle.objects.get(id=vehicle_id, driving_school=driving_school)
            except Vehicle.DoesNotExist:
                error_msg = _('Véhicule non trouvé ou non assigné') if user.user_type == 'instructor' else _('Véhicule non trouvé')
                return Response({'error': error_msg},
                               status=status.HTTP_404_NOT_FOUND)

            # Créer la dépense
            expense = VehicleExpense.objects.create(
                vehicle=vehicle,
                driving_school=driving_school,
                category=category,
                description=description,
                amount=amount,
                date=date,
                odometer_reading=odometer_reading if odometer_reading else None,
                notes=notes,
                receipt=receipt
            )

            # Créer automatiquement une écriture comptable pour la dépense véhicule
            from .models import AccountingEntry
            AccountingEntry.objects.create(
                driving_school=driving_school,
                entry_type='expense',
                category='vehicle',
                description=f"Véhicule {vehicle.license_plate} - {description}",
                amount=amount,
                date=date,
                vehicle_expense=expense
            )

            # Envoyer une notification à l'auto-école si c'est un moniteur qui a ajouté la dépense
            if user.user_type == 'instructor':
                try:
                    from notifications.models import Notification
                    from channels.layers import get_channel_layer
                    from asgiref.sync import async_to_sync

                    driving_school_user = driving_school.owner
                    instructor_name = f"{user.instructor_profile.first_name} {user.instructor_profile.last_name}"

                    notification = Notification.objects.create(
                        recipient=driving_school_user,
                        notification_type='vehicle_expense',
                        title='Nouvelle dépense véhicule',
                        message=f'{instructor_name} a ajouté une dépense de {amount}DT pour le véhicule {vehicle.license_plate} ({description}).',
                        priority='medium',
                        related_vehicle_id=vehicle.id
                    )

                    # Envoyer via WebSocket
                    channel_layer = get_channel_layer()
                    if channel_layer:
                        async_to_sync(channel_layer.group_send)(
                            f"user_{driving_school_user.id}",
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

                    print(f"📨 Notification de dépense véhicule envoyée à l'auto-école {driving_school_user.username}")
                except Exception as e:
                    print(f"❌ Erreur lors de l'envoi de la notification de dépense: {e}")

            return Response({
                'message': _('Dépense créée avec succès'),
                'id': str(expense.id)
            })

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'POST'])
@permission_classes([permissions.IsAuthenticated])
def accounting_entries_view(request):
    """Vue pour gérer les écritures comptables (Premium uniquement)"""
    user = request.user

    # Déterminer l'auto-école selon le type d'utilisateur
    driving_school = None
    if hasattr(user, 'driving_school'):
        driving_school = user.driving_school
    elif user.user_type == 'instructor' and hasattr(user, 'instructor_profile'):
        driving_school = user.instructor_profile.driving_school

    if not driving_school:
        return Response({'error': _('Auto-école non trouvée')},
                       status=status.HTTP_404_NOT_FOUND)

    # Vérifier que l'auto-école a un plan Premium
    if driving_school.current_plan != 'premium':
        return Response({'error': _('Fonctionnalité disponible uniquement pour le plan Premium')},
                       status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        try:
            from .models import AccountingEntry, VehicleExpense
            from datetime import datetime, timedelta

            # Synchroniser automatiquement toutes les données à chaque appel
            sync_all_accounting_data(driving_school)

            # Filtrer par période
            period = request.GET.get('period', 'month')
            today = timezone.now().date()

            if period == 'week':
                start_date = today - timedelta(days=7)
            elif period == 'month':
                start_date = today - timedelta(days=30)
            elif period == 'quarter':
                start_date = today - timedelta(days=90)
            elif period == 'year':
                start_date = today - timedelta(days=365)
            else:
                start_date = today - timedelta(days=30)

            entries = AccountingEntry.objects.filter(
                driving_school=driving_school,
                date__gte=start_date
            ).order_by('-date')

            entries_data = []
            for entry in entries:
                entry_data = {
                    'id': str(entry.id),
                    'entry_type': entry.entry_type,
                    'category': entry.category,
                    'description': entry.description,
                    'amount': float(entry.amount),
                    'date': entry.date.isoformat(),
                    'notes': entry.notes,
                }

                # Ajouter les infos du véhicule si c'est une dépense véhicule
                if entry.vehicle_expense:
                    entry_data['vehicle_expense'] = {
                        'vehicle': {
                            'brand': entry.vehicle_expense.vehicle.brand,
                            'model': entry.vehicle_expense.vehicle.model,
                            'license_plate': entry.vehicle_expense.vehicle.license_plate,
                        }
                    }

                entries_data.append(entry_data)

            return Response(entries_data)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    elif request.method == 'POST':
        try:
            from .models import AccountingEntry

            # Récupérer les données
            entry_type = request.data.get('entry_type')
            category = request.data.get('category')
            description = request.data.get('description')
            amount = request.data.get('amount')
            date = request.data.get('date')
            notes = request.data.get('notes', '')

            # Validation
            if not all([entry_type, category, description, amount, date]):
                return Response({'error': _('Tous les champs obligatoires doivent être remplis')},
                               status=status.HTTP_400_BAD_REQUEST)

            # Créer l'écriture comptable
            entry = AccountingEntry.objects.create(
                driving_school=driving_school,
                entry_type=entry_type,
                category=category,
                description=description,
                amount=amount,
                date=date,
                notes=notes
            )

            return Response({
                'message': _('Écriture comptable créée avec succès'),
                'id': str(entry.id)
            })

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def financial_summary_view(request):
    """Vue pour le résumé financier (Premium uniquement)"""
    user = request.user

    # Déterminer l'auto-école selon le type d'utilisateur
    driving_school = None
    if hasattr(user, 'driving_school'):
        driving_school = user.driving_school
    elif user.user_type == 'instructor' and hasattr(user, 'instructor_profile'):
        driving_school = user.instructor_profile.driving_school

    if not driving_school:
        return Response({'error': _('Auto-école non trouvée')},
                       status=status.HTTP_404_NOT_FOUND)

    # Vérifier que l'auto-école a un plan Premium
    if driving_school.current_plan != 'premium':
        return Response({'error': _('Fonctionnalité disponible uniquement pour le plan Premium')},
                       status=status.HTTP_403_FORBIDDEN)

    try:
        from .models import AccountingEntry
        from datetime import datetime, timedelta
        from django.db.models import Sum, Q

        # Synchroniser automatiquement toutes les données
        sync_all_accounting_data(driving_school)

        # Filtrer par période
        period = request.GET.get('period', 'month')
        today = timezone.now().date()

        if period == 'week':
            start_date = today - timedelta(days=7)
        elif period == 'month':
            start_date = today - timedelta(days=30)
        elif period == 'quarter':
            start_date = today - timedelta(days=90)
        elif period == 'year':
            start_date = today - timedelta(days=365)
        else:
            start_date = today - timedelta(days=30)

        entries = AccountingEntry.objects.filter(
            driving_school=driving_school,
            date__gte=start_date
        )

        # Calculs des totaux
        total_revenue = entries.filter(entry_type='revenue').aggregate(
            total=Sum('amount')
        )['total'] or 0

        total_expenses = entries.filter(entry_type='expense').aggregate(
            total=Sum('amount')
        )['total'] or 0

        net_profit = total_revenue - total_expenses

        # Répartition des dépenses par catégorie
        expense_categories = entries.filter(entry_type='expense').values('category').annotate(
            amount=Sum('amount')
        ).order_by('-amount')

        expense_by_category = []
        for cat in expense_categories:
            percentage = (cat['amount'] / total_expenses * 100) if total_expenses > 0 else 0
            expense_by_category.append({
                'category': cat['category'],
                'amount': float(cat['amount']),
                'percentage': percentage
            })

        # Répartition des revenus par catégorie
        revenue_categories = entries.filter(entry_type='revenue').values('category').annotate(
            amount=Sum('amount')
        ).order_by('-amount')

        revenue_by_category = []
        for cat in revenue_categories:
            percentage = (cat['amount'] / total_revenue * 100) if total_revenue > 0 else 0
            revenue_by_category.append({
                'category': cat['category'],
                'amount': float(cat['amount']),
                'percentage': percentage
            })

        # Données mensuelles (pour les 6 derniers mois)
        monthly_data = []
        for i in range(6):
            month_start = today.replace(day=1) - timedelta(days=i*30)
            month_end = month_start + timedelta(days=30)

            month_entries = entries.filter(date__gte=month_start, date__lt=month_end)

            month_revenue = month_entries.filter(entry_type='revenue').aggregate(
                total=Sum('amount')
            )['total'] or 0

            month_expenses = month_entries.filter(entry_type='expense').aggregate(
                total=Sum('amount')
            )['total'] or 0

            monthly_data.append({
                'month': month_start.strftime('%B %Y'),
                'revenue': float(month_revenue),
                'expenses': float(month_expenses),
                'profit': float(month_revenue - month_expenses)
            })

        monthly_data.reverse()  # Ordre chronologique

        summary = {
            'total_revenue': float(total_revenue),
            'total_expenses': float(total_expenses),
            'net_profit': float(net_profit),
            'expense_by_category': expense_by_category,
            'revenue_by_category': revenue_by_category,
            'monthly_data': monthly_data
        }

        return Response(summary)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def create_subscription_accounting_entry(driving_school, plan_type, amount, is_renewal=False):
    """
    Créer automatiquement une écriture comptable pour les abonnements
    """
    try:
        from .models import AccountingEntry

        description = f"{'Renouvellement' if is_renewal else 'Achat'} plan {plan_type.title()}"

        AccountingEntry.objects.create(
            driving_school=driving_school,
            entry_type='expense',
            category='subscription',
            description=description,
            amount=amount,
            date=timezone.now().date()
        )
    except Exception as e:
        print(f"Erreur lors de la création de l'écriture comptable d'abonnement: {e}")


def import_existing_payments_to_accounting(driving_school):
    """
    Importer automatiquement tous les paiements existants des candidats en tant que revenus
    """
    imported_count = 0
    try:
        from .models import AccountingEntry
        from students.models import Student

        # Récupérer tous les candidats de l'auto-école avec des paiements
        students = Student.objects.filter(
            driving_school=driving_school,
            paid_amount__gt=0  # Seulement ceux qui ont payé quelque chose
        )

        print(f"Trouvé {students.count()} candidats avec des paiements")

        for student in students:
            # Importer le montant payé par le candidat
            if student.paid_amount > 0:
                # Vérifier si cette écriture existe déjà
                existing_entry = AccountingEntry.objects.filter(
                    driving_school=driving_school,
                    entry_type='revenue',
                    category='student_fees',
                    description__contains=f"{student.first_name} {student.last_name}",
                    amount=student.paid_amount
                ).first()

                if not existing_entry:
                    AccountingEntry.objects.create(
                        driving_school=driving_school,
                        entry_type='revenue',
                        category='student_fees',
                        description=f"Paiement candidat - {student.first_name} {student.last_name}",
                        amount=student.paid_amount,
                        date=student.created_at.date()
                    )
                    imported_count += 1
                    print(f"Ajouté paiement de {student.paid_amount} DT pour {student.first_name} {student.last_name}")

    except Exception as e:
        print(f"Erreur lors de l'importation des paiements: {e}")

    return imported_count


def import_existing_subscription_to_accounting(driving_school):
    """
    Importer l'abonnement actuel comme dépense si ce n'est pas déjà fait
    """
    imported_count = 0
    try:
        from .models import AccountingEntry

        print(f"Plan actuel: {driving_school.current_plan}")

        if driving_school.current_plan in ['standard', 'premium']:
            plan_prices = {
                'standard': 50.00,
                'premium': 100.00
            }

            # Vérifier si l'abonnement actuel est déjà en comptabilité
            existing_entry = AccountingEntry.objects.filter(
                driving_school=driving_school,
                entry_type='expense',
                category='subscription'
            ).first()

            if not existing_entry and driving_school.current_plan in plan_prices:
                AccountingEntry.objects.create(
                    driving_school=driving_school,
                    entry_type='expense',
                    category='subscription',
                    description=f"Abonnement plan {driving_school.current_plan.title()}",
                    amount=plan_prices[driving_school.current_plan],
                    date=driving_school.plan_start_date.date() if driving_school.plan_start_date else timezone.now().date()
                )
                imported_count += 1
                print(f"Ajouté abonnement {driving_school.current_plan} - {plan_prices[driving_school.current_plan]} DT")
            else:
                print(f"Abonnement déjà existant ou plan non payant")

    except Exception as e:
        print(f"Erreur lors de l'importation de l'abonnement: {e}")

    return imported_count


def create_payment_accounting_entry(driving_school, student, amount, payment_date=None):
    """
    Créer automatiquement une écriture comptable pour un nouveau paiement
    """
    try:
        from .models import AccountingEntry

        if payment_date is None:
            payment_date = timezone.now().date()

        AccountingEntry.objects.create(
            driving_school=driving_school,
            entry_type='revenue',
            category='student_fees',
            description=f"Paiement - {student.first_name} {student.last_name}",
            amount=amount,
            date=payment_date
        )
    except Exception as e:
        print(f"Erreur lors de la création de l'écriture comptable de paiement: {e}")


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def import_existing_data_to_accounting(request):
    """Vue pour forcer l'importation des données existantes en comptabilité"""
    user = request.user
    if not hasattr(user, 'driving_school'):
        return Response({'error': _('Auto-école non trouvée')},
                       status=status.HTTP_404_NOT_FOUND)

    driving_school = user.driving_school

    # Vérifier que l'auto-école a un plan Premium
    if driving_school.current_plan != 'premium':
        return Response({'error': _('Fonctionnalité disponible uniquement pour le plan Premium')},
                       status=status.HTTP_403_FORBIDDEN)

    try:
        from .models import AccountingEntry

        # Supprimer SEULEMENT les écritures automatiques spécifiques (pas les dépenses véhicules ni les manuelles)

        # Supprimer seulement les abonnements automatiques
        AccountingEntry.objects.filter(
            driving_school=driving_school,
            category='subscription'  # Abonnements automatiques
        ).delete()

        # Supprimer seulement les paiements étudiants automatiques (pas les revenus manuels)
        AccountingEntry.objects.filter(
            driving_school=driving_school,
            category='student_fees',
            description__contains='Paiement candidat'  # Seulement les automatiques
        ).delete()

        # Importer seulement les données manquantes
        payments_imported = import_existing_payments_to_accounting(driving_school)
        subscription_imported = import_existing_subscription_to_accounting(driving_school)

        # Compter les écritures créées
        total_entries = AccountingEntry.objects.filter(driving_school=driving_school).count()

        return Response({
            'message': f'Importation terminée. {payments_imported + subscription_imported} nouvelles écritures ajoutées. {total_entries} écritures au total.',
            'total_entries': total_entries,
            'new_entries': payments_imported + subscription_imported
        })

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def recent_activities_view(request):
    """Vue pour récupérer les activités récentes"""
    user = request.user
    if not hasattr(user, 'driving_school'):
        return Response({'error': _('Auto-école non trouvée')},
                       status=status.HTTP_404_NOT_FOUND)

    driving_school = user.driving_school

    try:
        activities = []

        # Import des modèles avec gestion d'erreur
        try:
            from students.models import Student
        except ImportError:
            Student = None

        try:
            from instructors.models import Instructor
        except ImportError:
            Instructor = None

        try:
            from vehicles.models import Vehicle
        except ImportError:
            Vehicle = None

        try:
            from exams.models import Exam
        except ImportError:
            Exam = None

        try:
            from payments.models import Payment
        except ImportError:
            Payment = None

        try:
            from schedules.models import Schedule
        except ImportError:
            Schedule = None

        # Nouveaux candidats (30 derniers jours)
        if Student:
            recent_students = Student.objects.filter(
                driving_school=driving_school,
                registration_date__gte=timezone.now().date() - timedelta(days=30)
            ).order_by('-registration_date')[:10]

            for student in recent_students:
                # Créer un datetime à partir de la date d'inscription
                registration_datetime = timezone.datetime.combine(
                    student.registration_date,
                    timezone.datetime.min.time()
                ).replace(tzinfo=timezone.get_current_timezone())

                activities.append({
                    'id': f'student_{student.id}',
                    'type': 'student_registered',
                    'title': 'Nouveau candidat inscrit',
                    'description': f'{student.first_name} {student.last_name} s\'est inscrit pour le permis {student.license_type}',
                    'time': registration_datetime.isoformat(),
                    'icon': 'UserPlusIcon',
                    'color': 'text-blue-600 dark:text-blue-400',
                    'status': 'success'
                })

        # Nouveaux moniteurs (30 derniers jours)
        if Instructor:
            recent_instructors = Instructor.objects.filter(
                driving_school=driving_school,
                created_at__gte=timezone.now() - timedelta(days=30)
            ).order_by('-created_at')[:5]

            for instructor in recent_instructors:
                activities.append({
                    'id': f'instructor_{instructor.id}',
                    'type': 'instructor_added',
                    'title': 'Nouveau moniteur ajouté',
                    'description': f'{instructor.first_name} {instructor.last_name} a rejoint l\'équipe',
                    'time': instructor.created_at.isoformat(),
                    'icon': 'AcademicCapIcon',
                    'color': 'text-purple-600 dark:text-purple-400',
                    'status': 'success'
                })

        # Paiements récents (14 derniers jours)
        if Payment:
            recent_payments = Payment.objects.filter(
                student__driving_school=driving_school,
                created_at__gte=timezone.now() - timedelta(days=14),
                status='paid'
            ).order_by('-created_at')[:8]

            for payment in recent_payments:
                activities.append({
                    'id': f'payment_{payment.id}',
                    'type': 'payment_received',
                    'title': 'Paiement reçu',
                    'description': f'{payment.student.first_name} {payment.student.last_name} - {payment.amount} DT ({payment.get_payment_type_display()})',
                    'time': payment.created_at.isoformat(),
                    'icon': 'CreditCardIcon',
                    'color': 'text-green-600 dark:text-green-400',
                    'status': 'success'
                })

        # Examens récents (14 derniers jours) - tous les résultats
        if Exam:
            recent_exams = Exam.objects.filter(
                student__driving_school=driving_school,
                exam_date__gte=timezone.now() - timedelta(days=14)
            ).order_by('-exam_date')[:8]

            for exam in recent_exams:
                if exam.result == 'passed':
                    activities.append({
                        'id': f'exam_passed_{exam.id}',
                        'type': 'exam_completed',
                        'title': 'Examen réussi',
                        'description': f'{exam.student.first_name} {exam.student.last_name} - Examen {exam.get_exam_type_display()} réussi',
                        'time': exam.exam_date.isoformat(),
                        'icon': 'CheckCircleIcon',
                        'color': 'text-emerald-600 dark:text-emerald-400',
                        'status': 'success'
                    })
                elif exam.result == 'failed':
                    activities.append({
                        'id': f'exam_failed_{exam.id}',
                        'type': 'exam_failed',
                        'title': 'Examen échoué',
                        'description': f'{exam.student.first_name} {exam.student.last_name} - Examen {exam.get_exam_type_display()} à reprendre',
                        'time': exam.exam_date.isoformat(),
                        'icon': 'XCircleIcon',
                        'color': 'text-red-600 dark:text-red-400',
                        'status': 'error'
                    })
                elif exam.result == 'pending':
                    activities.append({
                        'id': f'exam_scheduled_{exam.id}',
                        'type': 'exam_scheduled',
                        'title': 'Examen programmé',
                        'description': f'{exam.student.first_name} {exam.student.last_name} - Examen {exam.get_exam_type_display()} prévu',
                        'time': exam.exam_date.isoformat(),
                        'icon': 'ClipboardDocumentListIcon',
                        'color': 'text-blue-600 dark:text-blue-400',
                        'status': 'warning'
                    })

        # Séances récentes (7 derniers jours)
        if Schedule:
            recent_schedules = Schedule.objects.filter(
                driving_school=driving_school,
                date__gte=timezone.now().date() - timedelta(days=7),
                status='completed'
            ).order_by('-date', '-start_time')[:5]

            for schedule in recent_schedules:
                # Créer un datetime complet à partir de la date et heure de début
                schedule_datetime = timezone.datetime.combine(
                    schedule.date,
                    schedule.start_time
                ).replace(tzinfo=timezone.get_current_timezone())

                activities.append({
                    'id': f'schedule_{schedule.id}',
                    'type': 'session_completed',
                    'title': 'Séance terminée',
                    'description': f'{schedule.student.first_name} {schedule.student.last_name} - Séance {schedule.get_session_type_display()}',
                    'time': schedule_datetime.isoformat(),
                    'icon': 'CalendarDaysIcon',
                    'color': 'text-indigo-600 dark:text-indigo-400',
                    'status': 'success'
                })

        # Nouveaux véhicules (60 derniers jours)
        if Vehicle:
            recent_vehicles = Vehicle.objects.filter(
                driving_school=driving_school,
                created_at__gte=timezone.now() - timedelta(days=60)
            ).order_by('-created_at')[:3]

            for vehicle in recent_vehicles:
                activities.append({
                    'id': f'vehicle_{vehicle.id}',
                    'type': 'vehicle_added',
                    'title': 'Nouveau véhicule',
                    'description': f'{vehicle.brand} {vehicle.model} ({vehicle.license_plate}) ajouté à la flotte',
                    'time': vehicle.created_at.isoformat(),
                    'icon': 'TruckIcon',
                    'color': 'text-orange-600 dark:text-orange-400',
                    'status': 'success'
                })

        # Trier par date décroissante
        activities.sort(key=lambda x: x['time'], reverse=True)

        # Si aucune activité récente, retourner des activités par défaut basées sur les données existantes
        if not activities:
            # Récupérer quelques données existantes pour créer des activités par défaut
            if Student:
                latest_students = Student.objects.filter(driving_school=driving_school).order_by('-created_at')[:3]
                for i, student in enumerate(latest_students):
                    # Utiliser la date de création ou d'inscription, la plus récente
                    activity_time = max(student.created_at,
                                      timezone.datetime.combine(student.registration_date, timezone.datetime.min.time()).replace(tzinfo=timezone.get_current_timezone()))

                    activities.append({
                        'id': f'default_student_{student.id}',
                        'type': 'student_registered',
                        'title': 'Candidat inscrit',
                        'description': f'{student.first_name} {student.last_name} - Permis {student.license_type}',
                        'time': activity_time.isoformat(),
                        'icon': 'UserPlusIcon',
                        'color': 'text-blue-600 dark:text-blue-400',
                        'status': 'success'
                    })

            if Instructor:
                latest_instructors = Instructor.objects.filter(driving_school=driving_school).order_by('-created_at')[:2]
                for instructor in latest_instructors:
                    activities.append({
                        'id': f'default_instructor_{instructor.id}',
                        'type': 'instructor_added',
                        'title': 'Moniteur dans l\'équipe',
                        'description': f'{instructor.first_name} {instructor.last_name} - Moniteur actif',
                        'time': instructor.created_at.isoformat(),
                        'icon': 'AcademicCapIcon',
                        'color': 'text-purple-600 dark:text-purple-400',
                        'status': 'success'
                    })

            if Vehicle:
                latest_vehicles = Vehicle.objects.filter(driving_school=driving_school).order_by('-created_at')[:2]
                for vehicle in latest_vehicles:
                    activities.append({
                        'id': f'default_vehicle_{vehicle.id}',
                        'type': 'vehicle_added',
                        'title': 'Véhicule de la flotte',
                        'description': f'{vehicle.brand} {vehicle.model} ({vehicle.license_plate})',
                        'time': vehicle.created_at.isoformat(),
                        'icon': 'TruckIcon',
                        'color': 'text-orange-600 dark:text-orange-400',
                        'status': 'success'
                    })

            # Trier à nouveau après ajout des activités par défaut
            activities.sort(key=lambda x: x['time'], reverse=True)

        return Response(activities[:10])  # Limiter à 10 activités

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def upcoming_events_view(request):
    """Vue pour récupérer les événements à venir"""
    user = request.user
    if not hasattr(user, 'driving_school'):
        return Response({'error': _('Auto-école non trouvée')},
                       status=status.HTTP_404_NOT_FOUND)

    driving_school = user.driving_school

    try:
        events = []

        # Import des modèles avec gestion d'erreur
        try:
            from exams.models import Exam
        except ImportError:
            Exam = None

        try:
            from schedules.models import Schedule
        except ImportError:
            Schedule = None

        try:
            from vehicles.models import Vehicle
        except ImportError:
            Vehicle = None

        # Examens à venir (30 prochains jours)
        if Exam:
            upcoming_exams = Exam.objects.filter(
                student__driving_school=driving_school,
                exam_date__gte=timezone.now(),
                exam_date__lte=timezone.now() + timedelta(days=30)
            ).order_by('exam_date')[:10]

            for exam in upcoming_exams:
                events.append({
                    'id': f'exam_{exam.id}',
                    'type': 'exam',
                    'title': f'Examen {exam.exam_type}',
                    'description': f'{exam.student.first_name} {exam.student.last_name}',
                    'date': exam.exam_date.date().isoformat(),
                    'time': exam.exam_date.time().strftime('%H:%M'),
                    'location': exam.exam_location or 'Centre d\'examen',
                    'icon': 'ClipboardDocumentListIcon',
                    'color': 'text-purple-600 dark:text-purple-400'
                })

        # Séances programmées (7 prochains jours)
        if Schedule:
            upcoming_sessions = Schedule.objects.filter(
                student__driving_school=driving_school,
                date__gte=timezone.now().date(),
                date__lte=timezone.now().date() + timedelta(days=7),
                status='scheduled'
            ).order_by('date', 'start_time')[:10]

            for session in upcoming_sessions:
                instructor_name = ""
                if hasattr(session, 'instructor') and session.instructor:
                    instructor_name = f" avec {session.instructor.first_name} {session.instructor.last_name}"

                events.append({
                    'id': f'session_{session.id}',
                    'type': 'session',
                    'title': f'Séance {session.session_type}',
                    'description': f'{session.student.first_name} {session.student.last_name}{instructor_name}',
                    'date': session.date.isoformat(),
                    'time': session.start_time.strftime('%H:%M'),
                    'location': 'Auto-école',
                    'icon': 'CalendarDaysIcon',
                    'color': 'text-blue-600 dark:text-blue-400'
                })

        # Rappels véhicules (contrôle technique, assurance)
        if Vehicle:
            vehicles_reminders = Vehicle.objects.filter(
                driving_school=driving_school,
                status='active'
            )

            for vehicle in vehicles_reminders:
                # Contrôle technique dans les 30 prochains jours
                if vehicle.technical_inspection_date and vehicle.technical_inspection_date <= timezone.now().date() + timedelta(days=30):
                    events.append({
                        'id': f'tech_{vehicle.id}',
                        'type': 'reminder',
                        'title': 'Contrôle technique',
                        'description': f'{vehicle.brand} {vehicle.model} - {vehicle.license_plate}',
                        'date': vehicle.technical_inspection_date.isoformat(),
                        'time': '09:00',
                        'location': 'Centre de contrôle',
                        'icon': 'ExclamationTriangleIcon',
                        'color': 'text-red-600 dark:text-red-400'
                    })

                # Assurance dans les 30 prochains jours
                if vehicle.insurance_expiry_date and vehicle.insurance_expiry_date <= timezone.now().date() + timedelta(days=30):
                    events.append({
                        'id': f'insurance_{vehicle.id}',
                        'type': 'reminder',
                        'title': 'Renouvellement assurance',
                        'description': f'{vehicle.brand} {vehicle.model} - {vehicle.license_plate}',
                        'date': vehicle.insurance_expiry_date.isoformat(),
                        'time': '09:00',
                        'location': 'Assurance',
                        'icon': 'ExclamationTriangleIcon',
                        'color': 'text-yellow-600 dark:text-yellow-400'
                    })

        # Trier par date croissante
        events.sort(key=lambda x: (x['date'], x['time']))

        return Response(events[:15])  # Limiter à 15 événements

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def debug_students_payments(request):
    """Vue de debug pour voir les paiements des candidats"""
    user = request.user
    if not hasattr(user, 'driving_school'):
        return Response({'error': _('Auto-école non trouvée')},
                       status=status.HTTP_404_NOT_FOUND)

    driving_school = user.driving_school

    try:
        from students.models import Student

        students = Student.objects.filter(driving_school=driving_school)

        students_data = []
        for student in students:
            students_data.append({
                'id': str(student.id),
                'name': f"{student.first_name} {student.last_name}",
                'paid_amount': float(student.paid_amount),
                'total_amount': float(student.total_amount) if student.total_amount else 0,
                'created_at': student.created_at.isoformat()
            })

        return Response({
            'total_students': len(students_data),
            'students_with_payments': len([s for s in students_data if s['paid_amount'] > 0]),
            'total_paid_amount': sum(s['paid_amount'] for s in students_data),
            'students': students_data
        })

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def sync_accounting_data(request):
    """Vue pour synchroniser les nouvelles données sans supprimer les existantes"""
    user = request.user
    if not hasattr(user, 'driving_school'):
        return Response({'error': _('Auto-école non trouvée')},
                       status=status.HTTP_404_NOT_FOUND)

    driving_school = user.driving_school

    # Vérifier que l'auto-école a un plan Premium
    if driving_school.current_plan != 'premium':
        return Response({'error': _('Fonctionnalité disponible uniquement pour le plan Premium')},
                       status=status.HTTP_403_FORBIDDEN)

    try:
        from .models import AccountingEntry

        # Importer seulement les nouvelles données (sans supprimer)
        payments_imported = import_existing_payments_to_accounting(driving_school)
        subscription_imported = import_existing_subscription_to_accounting(driving_school)

        # Compter les écritures totales
        total_entries = AccountingEntry.objects.filter(driving_school=driving_school).count()
        new_entries = payments_imported + subscription_imported

        return Response({
            'message': f'Synchronisation terminée. {new_entries} nouvelles écritures ajoutées.',
            'total_entries': total_entries,
            'new_entries': new_entries,
            'payments_imported': payments_imported,
            'subscription_imported': subscription_imported
        })

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def sync_all_accounting_data(driving_school):
    """
    Synchroniser automatiquement toutes les données comptables
    """
    try:
        from .models import AccountingEntry, VehicleExpense

        # 1. Synchroniser les paiements étudiants
        import_existing_payments_to_accounting(driving_school)

        # 2. Synchroniser l'abonnement
        import_existing_subscription_to_accounting(driving_school)

        # 3. Synchroniser les dépenses véhicules
        sync_vehicle_expenses_to_accounting(driving_school)

    except Exception as e:
        print(f"Erreur lors de la synchronisation complète: {e}")


def sync_vehicle_expenses_to_accounting(driving_school):
    """
    Synchroniser les dépenses véhicules vers la comptabilité
    """
    try:
        from .models import AccountingEntry, VehicleExpense

        # Récupérer toutes les dépenses véhicules qui n'ont pas d'écriture comptable
        vehicle_expenses = VehicleExpense.objects.filter(
            driving_school=driving_school,
            accounting_entry__isnull=True  # Pas encore en comptabilité
        )

        print(f"Trouvé {vehicle_expenses.count()} dépenses véhicules à synchroniser")

        for expense in vehicle_expenses:
            # Créer l'écriture comptable pour cette dépense véhicule
            accounting_entry = AccountingEntry.objects.create(
                driving_school=driving_school,
                entry_type='expense',
                category='vehicle',
                description=f"Véhicule {expense.vehicle.license_plate} - {expense.description}",
                amount=expense.amount,
                date=expense.date,
                vehicle_expense=expense
            )
            print(f"Synchronisé dépense véhicule: {expense.description} - {expense.amount} DT")

    except Exception as e:
        print(f"Erreur lors de la synchronisation des dépenses véhicules: {e}")



@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_driving_school_status_view(request):
    """Vue pour vérifier le statut d'approbation de l'auto-école"""
    user = request.user
    if not hasattr(user, 'driving_school'):
        return Response({'error': _('Auto-école non trouvée')},
                       status=status.HTTP_404_NOT_FOUND)

    driving_school = user.driving_school

    return Response({
        'status': driving_school.status,
        'name': driving_school.name,
        'created_at': driving_school.created_at,
        'is_approved': driving_school.status == 'approved',
        'can_access_dashboard': driving_school.status == 'approved'
    })








