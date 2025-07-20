from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from .models import DrivingSchool, Expense, Revenue
from accounts.serializers import UserSerializer


class DrivingSchoolSerializer(serializers.ModelSerializer):
    """Serializer pour les auto-écoles"""
    owner = UserSerializer(read_only=True)
    days_remaining = serializers.ReadOnlyField()
    can_add_accounts = serializers.ReadOnlyField()
    
    class Meta:
        model = DrivingSchool
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'current_accounts')


class DrivingSchoolCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer une auto-école"""
    
    class Meta:
        model = DrivingSchool
        fields = ('name', 'logo', 'manager_name', 'manager_photo', 'address',
                 'phone', 'email', 'license_number', 'cin_document', 'legal_documents',
                 'theme_color', 'dark_mode')
    
    def create(self, validated_data):
        # Associer l'utilisateur connecté comme propriétaire
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)


class DrivingSchoolUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour mettre à jour une auto-école"""
    
    class Meta:
        model = DrivingSchool
        fields = ('name', 'logo', 'manager_name', 'manager_photo', 'address',
                 'phone', 'email', 'license_number', 'theme_color', 'dark_mode')


class ExpenseSerializer(serializers.ModelSerializer):
    """Serializer pour les dépenses"""
    driving_school = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = Expense
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')
    
    def create(self, validated_data):
        # Associer l'auto-école de l'utilisateur connecté
        user = self.context['request'].user
        if hasattr(user, 'driving_school'):
            validated_data['driving_school'] = user.driving_school
        return super().create(validated_data)


class RevenueSerializer(serializers.ModelSerializer):
    """Serializer pour les revenus"""
    driving_school = serializers.StringRelatedField(read_only=True)
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    
    class Meta:
        model = Revenue
        fields = '__all__'
        read_only_fields = ('created_at',)
    
    def create(self, validated_data):
        # Associer l'auto-école de l'utilisateur connecté
        user = self.context['request'].user
        if hasattr(user, 'driving_school'):
            validated_data['driving_school'] = user.driving_school
        return super().create(validated_data)


class DashboardStatsSerializer(serializers.Serializer):
    """Serializer pour les statistiques du tableau de bord"""
    total_students = serializers.IntegerField()
    active_students = serializers.IntegerField()
    total_instructors = serializers.IntegerField()
    total_vehicles = serializers.IntegerField()
    monthly_revenue = serializers.DecimalField(max_digits=10, decimal_places=2)
    monthly_expenses = serializers.DecimalField(max_digits=10, decimal_places=2)
    pending_payments = serializers.IntegerField()
    upcoming_exams = serializers.IntegerField()


class SubscriptionSerializer(serializers.Serializer):
    """Serializer pour les informations d'abonnement"""
    current_plan = serializers.CharField()
    plan_start_date = serializers.DateTimeField()
    plan_end_date = serializers.DateTimeField()
    days_remaining = serializers.IntegerField()
    max_accounts = serializers.IntegerField()
    current_accounts = serializers.IntegerField()
    can_upgrade = serializers.BooleanField()
