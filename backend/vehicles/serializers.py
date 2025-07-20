from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from .models import Vehicle


class VehicleSerializer(serializers.ModelSerializer):
    """Serializer pour les véhicules"""
    driving_school_name = serializers.CharField(source='driving_school.name', read_only=True)
    assigned_instructor_name = serializers.CharField(source='assigned_instructor.full_name', read_only=True)
    is_available_now = serializers.ReadOnlyField()
    days_until_technical_control = serializers.ReadOnlyField()
    days_until_insurance_expiry = serializers.ReadOnlyField()

    class Meta:
        model = Vehicle
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')


class VehicleCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer un véhicule"""

    class Meta:
        model = Vehicle
        fields = ('id', 'brand', 'model', 'year', 'license_plate', 'vehicle_type',
                 'color', 'engine_number', 'chassis_number', 'current_mileage',
                 'technical_inspection_date', 'insurance_expiry_date', 'status', 'photo')
        read_only_fields = ('id',)
    
    def create(self, validated_data):
        # Associer l'auto-école de l'utilisateur connecté
        user = self.context['request'].user
        if hasattr(user, 'driving_school'):
            validated_data['driving_school'] = user.driving_school
        return super().create(validated_data)


class VehicleUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour mettre à jour un véhicule"""

    class Meta:
        model = Vehicle
        fields = ('brand', 'model', 'year', 'color', 'engine_number', 'chassis_number',
                 'current_mileage', 'technical_inspection_date', 'insurance_expiry_date', 'status', 'photo', 'assigned_instructor')


class VehicleListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour la liste des véhicules"""
    assigned_instructor_name = serializers.CharField(source='assigned_instructor.full_name', read_only=True)

    class Meta:
        model = Vehicle
        fields = ('id', 'brand', 'model', 'year', 'license_plate', 'vehicle_type',
                 'color', 'status', 'photo', 'assigned_instructor', 'assigned_instructor_name',
                 'technical_inspection_date', 'insurance_expiry_date')


class VehicleMaintenanceSerializer(serializers.Serializer):
    """Serializer pour la maintenance d'un véhicule"""
    maintenance_type = serializers.CharField()
    date = serializers.DateField()
    cost = serializers.DecimalField(max_digits=10, decimal_places=2)
    description = serializers.CharField()
    next_maintenance_date = serializers.DateField(required=False)


class VehicleStatsSerializer(serializers.Serializer):
    """Serializer pour les statistiques d'un véhicule"""
    total_hours_used = serializers.IntegerField()
    total_sessions = serializers.IntegerField()
    monthly_usage = serializers.IntegerField()
    maintenance_cost_this_year = serializers.DecimalField(max_digits=10, decimal_places=2)
    next_technical_control = serializers.DateField()
    next_insurance_renewal = serializers.DateField()
    average_daily_usage = serializers.FloatField()
