from rest_framework import serializers
from django.contrib.auth import authenticate
from django.utils.translation import gettext_lazy as _
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """Serializer pour les utilisateurs"""
    instructor_profile = serializers.SerializerMethodField()
    student_profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name',
                 'user_type', 'phone', 'cin', 'photo', 'is_verified', 'date_joined',
                 'instructor_profile', 'student_profile')
        read_only_fields = ('id', 'date_joined', 'is_verified')

    def get_instructor_profile(self, obj):
        """Inclure les informations du profil moniteur si l'utilisateur est un moniteur"""
        if obj.user_type == 'instructor' and hasattr(obj, 'instructor_profile'):
            instructor = obj.instructor_profile
            return {
                'id': instructor.id,
                'first_name': instructor.first_name,
                'last_name': instructor.last_name,
                'full_name': instructor.full_name,
                'driving_school': instructor.driving_school.id,
                'driving_school_name': instructor.driving_school.name,
                'photo': instructor.photo.url if instructor.photo else None,
            }
        return None

    def get_student_profile(self, obj):
        """Inclure les informations du profil étudiant si l'utilisateur est un étudiant"""
        if obj.user_type == 'student' and hasattr(obj, 'student'):
            student = obj.student
            return {
                'id': student.id,
                'first_name': student.first_name,
                'last_name': student.last_name,
                'full_name': student.full_name,
                'driving_school': student.driving_school.id,
                'driving_school_name': student.driving_school.name,
                'photo': student.photo.url if student.photo else None,
            }
        return None


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer pour l'inscription des utilisateurs"""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm', 
                 'first_name', 'last_name', 'user_type', 'phone', 'cin')
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError(_("Les mots de passe ne correspondent pas"))
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer pour la connexion avec email ou CIN"""
    login = serializers.CharField(help_text="Email ou CIN")
    password = serializers.CharField()

    def validate(self, attrs):
        login_field = attrs.get('login')
        password = attrs.get('password')

        if login_field and password:
            # Essayer de trouver l'utilisateur par email ou CIN
            user = None

            # Vérifier si c'est un email
            if '@' in login_field:
                try:
                    user = User.objects.get(email=login_field)
                except User.DoesNotExist:
                    pass
            else:
                # Sinon, chercher par CIN
                try:
                    user = User.objects.get(cin=login_field)
                except User.DoesNotExist:
                    pass

            # Vérifier le mot de passe
            if user and user.check_password(password):
                if not user.is_active:
                    raise serializers.ValidationError(_("Ce compte est désactivé"))
                attrs['user'] = user
            else:
                raise serializers.ValidationError(_("Email/CIN ou mot de passe incorrect"))
        else:
            raise serializers.ValidationError(_("Email/CIN et mot de passe requis"))

        return attrs


class PasswordChangeSerializer(serializers.Serializer):
    """Serializer pour changer le mot de passe"""
    old_password = serializers.CharField()
    new_password = serializers.CharField(min_length=8)
    new_password_confirm = serializers.CharField()
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError(_("Les nouveaux mots de passe ne correspondent pas"))
        return attrs
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError(_("Ancien mot de passe incorrect"))
        return value


class EmailVerificationSerializer(serializers.Serializer):
    """Serializer pour la vérification d'email"""
    verification_code = serializers.CharField(max_length=6)
    
    def validate_verification_code(self, value):
        user = self.context['request'].user
        if user.verification_code != value:
            raise serializers.ValidationError(_("Code de vérification incorrect"))
        return value
