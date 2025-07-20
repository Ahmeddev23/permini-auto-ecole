from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from .models import Instructor
from accounts.serializers import UserSerializer


class InstructorSerializer(serializers.ModelSerializer):
    """Serializer pour les moniteurs"""
    user = UserSerializer(read_only=True)
    driving_school_name = serializers.CharField(source='driving_school.name', read_only=True)
    full_name = serializers.ReadOnlyField()
    age = serializers.ReadOnlyField()
    
    class Meta:
        model = Instructor
        fields = '__all__'
        read_only_fields = ('hire_date', 'created_at', 'updated_at')


class InstructorCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer un moniteur"""
    license_types = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        help_text="Liste des types de permis (ex: ['B', 'A'])"
    )

    class Meta:
        model = Instructor
        fields = ('id', 'first_name', 'last_name', 'cin', 'phone',
                 'email', 'photo', 'license_types', 'hire_date', 'salary')
        read_only_fields = ('id',)

    def create(self, validated_data):
        # Convertir la liste des types de permis en chaîne
        license_types_list = validated_data.pop('license_types', [])
        validated_data['license_types'] = ','.join(license_types_list)

        # La création de l'utilisateur est gérée dans la vue (perform_create)
        # Ici on crée seulement le profil moniteur
        return super().create(validated_data)


class InstructorUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour mettre à jour un moniteur"""
    
    class Meta:
        model = Instructor
        fields = ('first_name', 'last_name', 'phone', 'email',
                 'photo', 'license_types', 'salary', 'is_active')


class InstructorListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour la liste des moniteurs"""
    full_name = serializers.ReadOnlyField()
    driving_school_name = serializers.CharField(source='driving_school.name', read_only=True)

    class Meta:
        model = Instructor
        fields = ('id', 'full_name', 'license_types', 'salary', 'hire_date',
                 'is_active', 'photo', 'driving_school_name', 'email', 'phone', 'cin')


class InstructorScheduleSerializer(serializers.Serializer):
    """Serializer pour l'emploi du temps d'un moniteur"""
    date = serializers.DateField()
    sessions = serializers.ListField(
        child=serializers.DictField()
    )


class InstructorStatsSerializer(serializers.Serializer):
    """Serializer pour les statistiques d'un moniteur"""
    total_students = serializers.IntegerField()
    active_students = serializers.IntegerField()
    total_hours_this_month = serializers.IntegerField()
    total_sessions_this_month = serializers.IntegerField()
    earnings_this_month = serializers.DecimalField(max_digits=10, decimal_places=2)
    upcoming_sessions = serializers.IntegerField()
    success_rate = serializers.FloatField()
    average_rating = serializers.FloatField()
