from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, logout
from django.core.mail import send_mail
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.http import JsonResponse
import random
import string

from .models import User
from .serializers import (
    UserSerializer, UserRegistrationSerializer, LoginSerializer,
    PasswordChangeSerializer, EmailVerificationSerializer
)
from driving_schools.models import DrivingSchool


class RegisterView(generics.CreateAPIView):
    """Vue pour l'inscription des utilisateurs"""
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Si c'est un utilisateur auto-école, créer l'auto-école associée
        if user.user_type == 'driving_school':
            # Récupérer les données de l'auto-école depuis la requête
            school_name = request.data.get('school_name', f"Auto-école de {user.first_name} {user.last_name}")
            school_address = request.data.get('school_address', "Adresse à compléter")
            school_phone = request.data.get('school_phone', user.phone)
            school_email = request.data.get('school_email', user.email)
            license_number = request.data.get('license_number', '')

            driving_school = DrivingSchool.objects.create(
                owner=user,
                name=school_name,
                manager_name=f"{user.first_name} {user.last_name}",
                address=school_address,
                phone=school_phone,
                email=school_email,
                license_number=license_number,
                cin_document=None,  # À uploader plus tard
                legal_documents=None,  # À uploader plus tard
                status='pending',  # En attente d'approbation
                current_plan='standard',  # Plan Standard gratuit 30 jours
                max_accounts=10,  # Limite Standard
            )
            print(f"Auto-école créée: {driving_school.name} pour {user.username}")

            # Notifier les admins de la nouvelle inscription
            try:
                from admin_dashboard.utils import notify_driving_school_registration
                notify_driving_school_registration(driving_school)
            except Exception as e:
                print(f"❌ Erreur lors de l'envoi de la notification admin: {e}")

        # Générer un code de vérification
        verification_code = ''.join(random.choices(string.digits, k=6))
        user.verification_code = verification_code
        user.save()

        # Envoyer l'email de vérification
        try:
            send_mail(
                subject=_('Vérification de votre compte Permini'),
                message=f'Votre code de vérification est : {verification_code}',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
        except Exception as e:
            # Log l'erreur mais ne pas faire échouer l'inscription
            print(f"Erreur envoi email: {e}")

        # Si l'utilisateur vient du nouveau flux (email déjà vérifié), créer le token
        # Vérifier si l'email a été pré-vérifié via notre nouveau système
        from django.core.cache import cache
        email_verified_key = f'email_verified_{user.email}'
        email_was_pre_verified = cache.get(email_verified_key, False)

        if email_was_pre_verified:
            # Email déjà vérifié, marquer l'utilisateur comme vérifié et créer le token
            user.is_verified = True
            user.save()

            # Créer le token pour l'authentification immédiate
            token, created = Token.objects.get_or_create(user=user)

            # Nettoyer le cache
            cache.delete(email_verified_key)

            return Response({
                'user': UserSerializer(user).data,
                'token': token.key,
                'message': _('Inscription réussie ! Vous êtes maintenant connecté.'),
                'verification_required': False
            }, status=status.HTTP_201_CREATED)
        else:
            # Ancien flux - vérification email requise
            return Response({
                'user': UserSerializer(user).data,
                'message': _('Inscription réussie. Vérifiez votre email pour activer votre compte.'),
                'verification_required': True
            }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_driving_school(request):
    """Vue pour la connexion des auto-écoles"""
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response({
            'error': _('Email et mot de passe requis')
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Chercher uniquement les utilisateurs auto-école
        user = User.objects.get(email=email, user_type='driving_school')

        if not user.check_password(password):
            return Response({
                'error': _('Email ou mot de passe incorrect')
            }, status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_verified:
            return Response({
                'error': _('Compte non vérifié')
            }, status=status.HTTP_401_UNAUTHORIZED)

        login(request, user)

        # Vérifier le statut d'approbation après la connexion
        try:
            driving_school = user.driving_school
            approval_status = driving_school.status
        except DrivingSchool.DoesNotExist:
            approval_status = 'unknown'
        token, created = Token.objects.get_or_create(user=user)

        # Ajouter les informations de l'auto-école
        response_data = {
            'user': UserSerializer(user).data,
            'token': token.key,
            'message': _('Connexion réussie')
        }

        try:
            driving_school = user.driving_school
            response_data['driving_school'] = {
                'id': driving_school.id,
                'name': driving_school.name,
                'status': driving_school.status,
                'current_plan': driving_school.current_plan,
            }
            response_data['approval_status'] = driving_school.status
            response_data['needs_approval'] = driving_school.status != 'approved'
        except DrivingSchool.DoesNotExist:
            response_data['driving_school'] = None
            response_data['approval_status'] = 'unknown'
            response_data['needs_approval'] = False

        return Response(response_data)

    except User.DoesNotExist:
        return Response({
            'error': _('Email ou mot de passe incorrect')
        }, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_student(request):
    """Vue pour la connexion des candidats"""
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response({
            'error': _('Email et mot de passe requis')
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Chercher uniquement les utilisateurs candidats
        user = User.objects.get(email=email, user_type='student')

        if not user.check_password(password):
            return Response({
                'error': _('Email ou mot de passe incorrect')
            }, status=status.HTTP_401_UNAUTHORIZED)

        login(request, user)
        token, created = Token.objects.get_or_create(user=user)

        return Response({
            'user': UserSerializer(user).data,
            'token': token.key,
            'message': _('Connexion réussie')
        })

    except User.DoesNotExist:
        return Response({
            'error': _('Email ou mot de passe incorrect')
        }, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_instructor(request):
    """Vue pour la connexion des moniteurs"""
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response({
            'error': _('Email et mot de passe requis')
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Chercher uniquement les utilisateurs moniteurs
        user = User.objects.get(email=email, user_type='instructor')

        if not user.check_password(password):
            return Response({
                'error': _('Email ou mot de passe incorrect')
            }, status=status.HTTP_401_UNAUTHORIZED)

        login(request, user)
        token, created = Token.objects.get_or_create(user=user)

        return Response({
            'user': UserSerializer(user).data,
            'token': token.key,
            'message': _('Connexion réussie')
        })

    except User.DoesNotExist:
        return Response({
            'error': _('Email ou mot de passe incorrect')
        }, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    """Vue pour la connexion (ancien endpoint - gardé pour compatibilité)"""
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        login(request, user)

        # Créer ou récupérer le token
        token, created = Token.objects.get_or_create(user=user)

        # Préparer les données de réponse
        response_data = {
            'user': UserSerializer(user).data,
            'token': token.key,
            'message': _('Connexion réussie')
        }

        # Si c'est une auto-école, ajouter les informations de statut
        if user.user_type == 'driving_school':
            try:
                driving_school = user.driving_school
                response_data['driving_school'] = {
                    'id': driving_school.id,
                    'name': driving_school.name,
                    'status': driving_school.status,
                    'current_plan': driving_school.current_plan,
                }
            except DrivingSchool.DoesNotExist:
                response_data['driving_school'] = None

        return Response(response_data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    """Vue pour la déconnexion"""
    try:
        # Supprimer le token
        request.user.auth_token.delete()
    except:
        pass

    logout(request)
    return Response({'message': _('Déconnexion réussie')})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def profile_view(request):
    """Vue pour récupérer le profil utilisateur"""
    user_data = UserSerializer(request.user).data

    # Ajouter les informations de l'auto-école si l'utilisateur est propriétaire d'une auto-école
    if hasattr(request.user, 'driving_school'):
        user_data['driving_school'] = {
            'id': request.user.driving_school.id,
            'name': request.user.driving_school.name,
            'email': request.user.driving_school.email,
            'phone': request.user.driving_school.phone,
            'address': request.user.driving_school.address,
        }

    return Response(user_data)


@api_view(['PUT'])
@permission_classes([permissions.IsAuthenticated])
def update_profile_view(request):
    """Vue pour mettre à jour le profil utilisateur"""
    serializer = UserSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password_view(request):
    """Vue pour changer le mot de passe"""
    serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()

        # Régénérer le token
        try:
            user.auth_token.delete()
        except:
            pass
        token = Token.objects.create(user=user)

        return Response({
            'token': token.key,
            'message': _('Mot de passe modifié avec succès')
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def verify_email_view(request):
    """Vue pour vérifier l'email avec code de vérification"""
    email = request.data.get('email')
    verification_code = request.data.get('verification_code')

    if not email or not verification_code:
        return Response({
            'error': _('Email et code de vérification requis')
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email, verification_code=verification_code)
        user.is_verified = True
        user.verification_code = None
        user.save()

        # Créer un token maintenant que l'email est vérifié
        token, created = Token.objects.get_or_create(user=user)

        return Response({
            'message': _('Email vérifié avec succès'),
            'user': UserSerializer(user).data,
            'token': token.key
        })
    except User.DoesNotExist:
        return Response({
            'error': _('Code de vérification incorrect ou expiré')
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def send_verification_code_view(request):
    """Vue pour envoyer un code de vérification avant inscription"""
    email = request.data.get('email')

    if not email:
        return Response({
            'error': _('Email requis')
        }, status=status.HTTP_400_BAD_REQUEST)

    # Vérifier que l'email n'est pas déjà utilisé
    if User.objects.filter(email=email).exists():
        return Response({
            'error': _('Cet email est déjà utilisé')
        }, status=status.HTTP_400_BAD_REQUEST)

    # Générer un code de vérification
    verification_code = ''.join(random.choices(string.digits, k=6))

    # Stocker temporairement le code dans le cache ou session
    # Pour simplifier, nous allons utiliser un modèle temporaire ou le cache Django
    from django.core.cache import cache
    cache_key = f'verification_code_{email}'
    cache.set(cache_key, verification_code, timeout=600)  # 10 minutes

    # Envoyer l'email
    try:
        send_mail(
            subject=_('Code de vérification Permini'),
            message=f'Votre code de vérification pour créer votre compte Permini est : {verification_code}',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
        return Response({
            'message': _('Code de vérification envoyé')
        })
    except Exception as e:
        return Response({
            'error': _('Erreur lors de l\'envoi de l\'email')
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def verify_code_before_registration_view(request):
    """Vue pour vérifier le code avant inscription"""
    email = request.data.get('email')
    verification_code = request.data.get('verification_code')

    if not email or not verification_code:
        return Response({
            'error': _('Email et code de vérification requis')
        }, status=status.HTTP_400_BAD_REQUEST)

    # Vérifier le code dans le cache
    from django.core.cache import cache
    cache_key = f'verification_code_{email}'
    stored_code = cache.get(cache_key)

    if not stored_code or stored_code != verification_code:
        return Response({
            'error': _('Code de vérification incorrect ou expiré')
        }, status=status.HTTP_400_BAD_REQUEST)

    # Code valide - le supprimer du cache
    cache.delete(cache_key)

    # Marquer l'email comme vérifié pour l'inscription future
    email_verified_key = f'email_verified_{email}'
    cache.set(email_verified_key, True, timeout=1800)  # 30 minutes

    return Response({
        'message': _('Code vérifié avec succès'),
        'email_verified': True
    })


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def resend_verification_view(request):
    """Vue pour renvoyer le code de vérification"""
    email = request.data.get('email')

    if not email:
        return Response({
            'error': _('Email requis')
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email, is_verified=False)
    except User.DoesNotExist:
        return Response({
            'error': _('Utilisateur non trouvé ou déjà vérifié')
        }, status=status.HTTP_400_BAD_REQUEST)

    # Générer un nouveau code
    verification_code = ''.join(random.choices(string.digits, k=6))
    user.verification_code = verification_code
    user.save()

    # Envoyer l'email
    try:
        send_mail(
            subject=_('Nouveau code de vérification Permini'),
            message=f'Votre nouveau code de vérification est : {verification_code}',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        return Response({
            'message': _('Code de vérification renvoyé')
        })
    except Exception as e:
        return Response({
            'error': _('Erreur lors de l\'envoi de l\'email')
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def check_email_availability(request):
    """Vue pour vérifier la disponibilité d'un email"""
    email = request.GET.get('email')
    if not email:
        return JsonResponse({'error': 'Email requis'}, status=400)

    exists = User.objects.filter(email=email).exists()
    return JsonResponse({'exists': exists})


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def check_cin_availability(request):
    """Vue pour vérifier la disponibilité d'un CIN"""
    cin = request.GET.get('cin')
    if not cin:
        return JsonResponse({'error': 'CIN requis'}, status=400)

    exists = User.objects.filter(cin=cin).exists()
    return JsonResponse({'exists': exists})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def upload_documents_view(request):
    """Vue pour uploader les documents de l'auto-école"""
    user = request.user

    if user.user_type != 'driving_school':
        return Response({
            'error': _('Seules les auto-écoles peuvent uploader des documents')
        }, status=status.HTTP_403_FORBIDDEN)

    if not hasattr(user, 'driving_school'):
        return Response({
            'error': _('Auto-école non trouvée')
        }, status=status.HTTP_404_NOT_FOUND)

    driving_school = user.driving_school

    # Traiter les fichiers uploadés
    if 'cin_document' in request.FILES:
        driving_school.cin_document = request.FILES['cin_document']

    if 'legal_documents' in request.FILES:
        driving_school.legal_documents = request.FILES['legal_documents']

    driving_school.save()

    return Response({
        'message': _('Documents uploadés avec succès'),
        'cin_document_uploaded': bool(driving_school.cin_document),
        'legal_documents_uploaded': bool(driving_school.legal_documents)
    })
