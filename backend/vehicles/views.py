from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Count, Sum
from django.utils import timezone
from datetime import datetime, timedelta, date
from django.utils.translation import gettext_lazy as _
from django.http import Http404

from .models import Vehicle
from .serializers import (
    VehicleSerializer, VehicleCreateSerializer, VehicleUpdateSerializer,
    VehicleListSerializer, VehicleMaintenanceSerializer, VehicleStatsSerializer
)


class VehicleListCreateView(generics.ListCreateAPIView):
    """Vue pour lister et créer les véhicules"""
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return VehicleCreateSerializer
        return VehicleListSerializer

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'driving_school'):
            return user.driving_school.vehicles.all()
        elif user.user_type == 'instructor' and hasattr(user, 'instructor_profile'):
            # Un moniteur ne peut voir que les véhicules qui lui sont assignés
            return user.instructor_profile.assigned_vehicles.all()
        return Vehicle.objects.none()


class VehicleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Vue pour récupérer, mettre à jour et supprimer un véhicule"""
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return VehicleUpdateSerializer
        return VehicleSerializer

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'driving_school'):
            return user.driving_school.vehicles.all()
        elif user.user_type == 'instructor' and hasattr(user, 'instructor_profile'):
            # Un moniteur ne peut voir que les véhicules qui lui sont assignés
            return user.instructor_profile.assigned_vehicles.all()
        return Vehicle.objects.none()


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def available_vehicles_view(request):
    """Vue pour récupérer les véhicules disponibles"""
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

    # Filtrer les véhicules disponibles
    if user.user_type == 'instructor' and hasattr(user, 'instructor_profile'):
        # Pour les moniteurs, ne montrer que leurs véhicules assignés
        available_vehicles = user.instructor_profile.assigned_vehicles.filter(
            status='active'
        )
    else:
        # Pour les auto-écoles, montrer tous les véhicules disponibles
        available_vehicles = driving_school.vehicles.filter(
            is_available=True
        )

    # Vérifier la disponibilité en temps réel
    now = timezone.now()
    truly_available = []

    for vehicle in available_vehicles:
        # Vérifier s'il n'y a pas de séance en cours
        current_sessions = vehicle.schedules.filter(
            date=now.date(),
            start_time__lte=now.time(),
            end_time__gte=now.time(),
            status='in_progress'
        )

        if not current_sessions.exists():
            truly_available.append(vehicle)

    serializer = VehicleListSerializer(truly_available, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def vehicle_stats_view(request, pk):
    """Vue pour les statistiques d'un véhicule"""
    user = request.user
    if not hasattr(user, 'driving_school'):
        return Response({'error': _('Auto-école non trouvée')},
                       status=status.HTTP_404_NOT_FOUND)

    try:
        vehicle = user.driving_school.vehicles.get(pk=pk)
    except Vehicle.DoesNotExist:
        return Response({'error': _('Véhicule non trouvé')},
                       status=status.HTTP_404_NOT_FOUND)

    # Calculer les statistiques
    current_month = timezone.now().replace(day=1)
    current_year = timezone.now().replace(month=1, day=1)

    # Utilisation totale
    total_sessions = vehicle.schedules.filter(status='completed').count()
    total_hours_used = sum([
        (session.end_time.hour - session.start_time.hour)
        for session in vehicle.schedules.filter(status='completed')
    ])

    # Utilisation mensuelle
    monthly_sessions = vehicle.schedules.filter(
        date__gte=current_month.date(),
        status='completed'
    ).count()

    # Coût de maintenance annuel (à implémenter avec un modèle Maintenance)
    maintenance_cost_this_year = 0  # Placeholder

    # Utilisation quotidienne moyenne
    days_in_service = (timezone.now().date() - vehicle.purchase_date).days
    average_daily_usage = total_hours_used / days_in_service if days_in_service > 0 else 0

    stats = {
        'total_hours_used': total_hours_used,
        'total_sessions': total_sessions,
        'monthly_usage': monthly_sessions,
        'maintenance_cost_this_year': maintenance_cost_this_year,
        'next_technical_control': vehicle.technical_control_date,
        'next_insurance_renewal': vehicle.insurance_expiry,
        'average_daily_usage': average_daily_usage,
    }

    serializer = VehicleStatsSerializer(stats)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def upload_vehicle_photo(request, pk):
    """Vue pour uploader la photo d'un véhicule"""
    user = request.user
    if not hasattr(user, 'driving_school'):
        return Response({'error': _('Auto-école non trouvée')},
                       status=status.HTTP_404_NOT_FOUND)

    try:
        vehicle = user.driving_school.vehicles.get(pk=pk)
    except Vehicle.DoesNotExist:
        return Response({'error': _('Véhicule non trouvé')},
                       status=status.HTTP_404_NOT_FOUND)

    if 'photo' not in request.FILES:
        return Response({'error': _('Aucune photo fournie')},
                       status=status.HTTP_400_BAD_REQUEST)

    # Supprimer l'ancienne photo si elle existe
    if vehicle.photo:
        vehicle.photo.delete(save=False)

    # Sauvegarder la nouvelle photo
    vehicle.photo = request.FILES['photo']
    vehicle.save()

    serializer = VehicleSerializer(vehicle)
    return Response({
        'message': _('Photo uploadée avec succès'),
        'vehicle': serializer.data
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def assign_vehicle_instructor(request, pk):
    """Vue pour assigner un véhicule à un moniteur"""
    user = request.user
    if not hasattr(user, 'driving_school'):
        return Response({'error': _('Auto-école non trouvée')},
                       status=status.HTTP_404_NOT_FOUND)

    try:
        vehicle = user.driving_school.vehicles.get(pk=pk)
    except Vehicle.DoesNotExist:
        return Response({'error': _('Véhicule non trouvé')},
                       status=status.HTTP_404_NOT_FOUND)

    instructor_id = request.data.get('instructor_id')

    if instructor_id:
        # Vérifier que le moniteur appartient à la même auto-école
        try:
            instructor = user.driving_school.instructors.get(pk=instructor_id)
            vehicle.assigned_instructor = instructor
        except:
            return Response({'error': _('Moniteur non trouvé')},
                           status=status.HTTP_404_NOT_FOUND)
    else:
        # Désassigner le moniteur
        vehicle.assigned_instructor = None

    vehicle.save()

    serializer = VehicleSerializer(vehicle)
    return Response({
        'message': _('Assignation mise à jour avec succès'),
        'vehicle': serializer.data
    })


@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def update_vehicle_dates(request, pk):
    """Vue pour mettre à jour les dates d'échéance d'un véhicule"""
    user = request.user
    if not hasattr(user, 'driving_school'):
        return Response({'error': _('Auto-école non trouvée')},
                       status=status.HTTP_404_NOT_FOUND)

    try:
        vehicle = user.driving_school.vehicles.get(pk=pk)
    except Vehicle.DoesNotExist:
        return Response({'error': _('Véhicule non trouvé')},
                       status=status.HTTP_404_NOT_FOUND)

    # Récupérer les nouvelles dates
    insurance_expiry_date = request.data.get('insurance_expiry_date')
    technical_inspection_date = request.data.get('technical_inspection_date')

    # Validation des dates
    today = date.today()

    if insurance_expiry_date:
        try:
            insurance_date = datetime.strptime(insurance_expiry_date, '%Y-%m-%d').date()
            if insurance_date <= today:
                return Response({'error': _('La date d\'expiration de l\'assurance doit être dans le futur')},
                               status=status.HTTP_400_BAD_REQUEST)
            vehicle.insurance_expiry_date = insurance_date
        except ValueError:
            return Response({'error': _('Format de date d\'assurance invalide')},
                           status=status.HTTP_400_BAD_REQUEST)

    if technical_inspection_date:
        try:
            technical_date = datetime.strptime(technical_inspection_date, '%Y-%m-%d').date()
            if technical_date <= today:
                return Response({'error': _('La date de visite technique doit être dans le futur')},
                               status=status.HTTP_400_BAD_REQUEST)
            vehicle.technical_inspection_date = technical_date
        except ValueError:
            return Response({'error': _('Format de date de visite technique invalide')},
                           status=status.HTTP_400_BAD_REQUEST)

    # Sauvegarder les modifications
    vehicle.save()

    serializer = VehicleSerializer(vehicle)
    return Response({
        'message': _('Dates mises à jour avec succès'),
        'vehicle': serializer.data
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def vehicles_for_schedule_view(request):
    """Vue pour récupérer les véhicules disponibles pour la création de séances"""
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

    # Pour la création de séances, montrer tous les véhicules actifs de l'auto-école
    # (les moniteurs peuvent utiliser d'autres véhicules pour les séances)
    vehicles = driving_school.vehicles.filter(status='active')

    from .serializers import VehicleListSerializer
    serializer = VehicleListSerializer(vehicles, many=True)
    return Response(serializer.data)
