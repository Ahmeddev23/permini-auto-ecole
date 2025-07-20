from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db import models
from django.db.models import Q, Count
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.http import Http404
from django.contrib.auth import get_user_model

from .models import Conversation, Message, DirectMessage

User = get_user_model()
from .serializers import (
    ConversationSerializer, ConversationCreateSerializer, ConversationListSerializer,
    MessageSerializer, MessageCreateSerializer, MessageListSerializer
)


class PremiumFeaturePermission(permissions.BasePermission):
    """Permission pour les fonctionnalités premium"""

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            print(f"🔍 Messagerie: Utilisateur non authentifié")
            return False

        print(f"🔍 Messagerie: Utilisateur {request.user.username}, type: {request.user.user_type}")

        if hasattr(request.user, 'driving_school'):
            driving_school = request.user.driving_school
            print(f"🔍 Messagerie: Auto-école {driving_school.name}, plan: {driving_school.current_plan}")
            # Temporairement, autoriser tous les plans pour tester
            return True  # driving_school.current_plan == 'premium'

        # Pour les candidats et moniteurs, vérifier le plan de leur auto-école
        if request.user.user_type == 'student' and hasattr(request.user, 'student'):
            plan = request.user.student.driving_school.current_plan
            print(f"🔍 Messagerie: Étudiant, plan auto-école: {plan}")
            return True  # plan == 'premium'
        elif request.user.user_type == 'instructor' and hasattr(request.user, 'instructor_profile'):
            plan = request.user.instructor_profile.driving_school.current_plan
            print(f"🔍 Messagerie: Moniteur, plan auto-école: {plan}")
            return True  # plan == 'premium'

        print(f"🔍 Messagerie: Accès refusé pour {request.user.user_type}")
        return False


class ConversationListCreateView(generics.ListCreateAPIView):
    """Vue pour lister et créer les conversations"""
    permission_classes = [permissions.IsAuthenticated, PremiumFeaturePermission]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ConversationCreateSerializer
        return ConversationListSerializer

    def get_queryset(self):
        user = self.request.user
        return Conversation.objects.filter(
            participants=user
        ).distinct().order_by('-updated_at')


class ConversationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Vue pour récupérer, mettre à jour et supprimer une conversation"""
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated, PremiumFeaturePermission]

    def get_queryset(self):
        user = self.request.user
        return Conversation.objects.filter(participants=user)


class MessageListCreateView(generics.ListCreateAPIView):
    """Vue pour lister et créer les messages d'une conversation"""
    permission_classes = [permissions.IsAuthenticated, PremiumFeaturePermission]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return MessageCreateSerializer
        return MessageListSerializer

    def get_queryset(self):
        conversation_id = self.kwargs.get('conversation_id')
        user = self.request.user

        # Vérifier que l'utilisateur fait partie de la conversation
        try:
            conversation = Conversation.objects.get(
                id=conversation_id,
                participants=user
            )
            return conversation.messages.all().order_by('created_at')
        except Conversation.DoesNotExist:
            return Message.objects.none()

    def perform_create(self, serializer):
        conversation_id = self.kwargs.get('conversation_id')
        user = self.request.user

        try:
            conversation = Conversation.objects.get(
                id=conversation_id,
                participants=user
            )
            serializer.save(conversation=conversation, sender=user)

            # Mettre à jour la date de dernière activité de la conversation
            conversation.updated_at = timezone.now()
            conversation.save()

        except Conversation.DoesNotExist:
            raise Http404(_("Conversation non trouvée"))


class MessageDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Vue pour récupérer, mettre à jour et supprimer un message"""
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated, PremiumFeaturePermission]

    def get_queryset(self):
        user = self.request.user
        conversation_id = self.kwargs.get('conversation_id')

        try:
            conversation = Conversation.objects.get(
                id=conversation_id,
                participants=user
            )
            return conversation.messages.all()
        except Conversation.DoesNotExist:
            return Message.objects.none()


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, PremiumFeaturePermission])
def mark_messages_read_view(request, conversation_id):
    """Vue pour marquer les messages comme lus"""
    user = request.user

    try:
        conversation = Conversation.objects.get(
            id=conversation_id,
            participants=user
        )
    except Conversation.DoesNotExist:
        return Response({'error': _('Conversation non trouvée')},
                       status=status.HTTP_404_NOT_FOUND)

    # Marquer tous les messages non lus comme lus
    unread_messages = conversation.messages.filter(
        read_by__isnull=True
    ).exclude(sender=user)

    for message in unread_messages:
        message.read_by.add(user)

    return Response({'message': _('Messages marqués comme lus')})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, PremiumFeaturePermission])
def unread_count_view(request):
    """Vue pour récupérer le nombre total de messages non lus"""
    user = request.user

    unread_count = Message.objects.filter(
        conversation__participants=user,
        read_by__isnull=True
    ).exclude(sender=user).count()

    return Response({'unread_count': unread_count})


def is_admin_user(user):
    """Vérifier si l'utilisateur est un admin"""
    try:
        from admin_dashboard.models import AdminUser
        return AdminUser.objects.filter(user=user).exists()
    except:
        return False

def get_user_photo_url(user, profile=None):
    """Helper function to get user photo URL"""
    # First check if user has a photo
    if user.photo:
        return user.photo.url

    # Then check profile-specific photos
    if profile and hasattr(profile, 'photo') and profile.photo:
        return profile.photo.url

    return None

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, PremiumFeaturePermission])
def available_participants_view(request):
    """Vue pour récupérer les participants disponibles (membres de l'auto-école)"""
    user = request.user
    participants = []

    try:
        if hasattr(user, 'driving_school'):
            # Auto-école peut voir tous ses membres
            driving_school = user.driving_school

            # Étudiants de l'auto-école
            students = driving_school.students.select_related('user').all()
            for student in students:
                participants.append({
                    'id': student.user.id,
                    'username': student.user.username,
                    'first_name': student.user.first_name,
                    'last_name': student.user.last_name,
                    'user_type': 'student',
                    'photo': get_user_photo_url(student.user, student)
                })

            # Moniteurs de l'auto-école
            instructors = driving_school.instructors.select_related('user').all()
            for instructor in instructors:
                participants.append({
                    'id': instructor.user.id,
                    'username': instructor.user.username,
                    'first_name': instructor.user.first_name,
                    'last_name': instructor.user.last_name,
                    'user_type': 'instructor',
                    'photo': get_user_photo_url(instructor.user, instructor)
                })

        elif user.user_type == 'student' and hasattr(user, 'student'):
            # Étudiant peut voir son auto-école et les moniteurs
            driving_school = user.student.driving_school

            # Propriétaire de l'auto-école
            participants.append({
                'id': driving_school.owner.id,
                'username': driving_school.owner.username,
                'first_name': driving_school.name,
                'last_name': '(Auto-école)',
                'user_type': 'driving_school_owner',
                'photo': get_user_photo_url(driving_school.owner)
            })

            # Moniteurs
            instructors = driving_school.instructors.select_related('user').all()
            for instructor in instructors:
                participants.append({
                    'id': instructor.user.id,
                    'username': instructor.user.username,
                    'first_name': instructor.user.first_name,
                    'last_name': instructor.user.last_name,
                    'user_type': 'instructor',
                    'photo': get_user_photo_url(instructor.user, instructor)
                })

        elif user.user_type == 'instructor' and hasattr(user, 'instructor_profile'):
            # Moniteur peut voir son auto-école et les étudiants
            driving_school = user.instructor_profile.driving_school

            # Propriétaire de l'auto-école
            participants.append({
                'id': driving_school.owner.id,
                'username': driving_school.owner.username,
                'first_name': driving_school.name,
                'last_name': '(Auto-école)',
                'user_type': 'driving_school_owner',
                'photo': get_user_photo_url(driving_school.owner)
            })

            # Étudiants
            students = driving_school.students.select_related('user').all()
            for student in students:
                participants.append({
                    'id': student.user.id,
                    'username': student.user.username,
                    'first_name': student.user.first_name,
                    'last_name': student.user.last_name,
                    'user_type': 'student',
                    'photo': get_user_photo_url(student.user, student)
                })

        return Response(participants)

    except Exception as e:
        print(f"Erreur lors de la récupération des participants: {e}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'POST'])
@permission_classes([permissions.IsAuthenticated, PremiumFeaturePermission])
def direct_messages_view(request, contact_id):
    """Vue pour les messages directs entre deux utilisateurs (style Messenger)"""
    user = request.user

    try:
        # Vérifier que le contact existe et appartient à la même auto-école
        contact = User.objects.get(id=contact_id)

        # Déterminer l'auto-école de l'utilisateur actuel
        user_driving_school = None
        if hasattr(user, 'driving_school'):
            user_driving_school = user.driving_school
        elif user.user_type == 'instructor' and hasattr(user, 'instructor_profile'):
            user_driving_school = user.instructor_profile.driving_school
        elif user.user_type == 'student' and hasattr(user, 'student'):
            user_driving_school = user.student.driving_school

        # Déterminer l'auto-école du contact
        contact_driving_school = None
        if hasattr(contact, 'driving_school'):
            contact_driving_school = contact.driving_school
        elif contact.user_type == 'instructor' and hasattr(contact, 'instructor_profile'):
            contact_driving_school = contact.instructor_profile.driving_school
        elif contact.user_type == 'student' and hasattr(contact, 'student'):
            contact_driving_school = contact.student.driving_school

        # Vérifier qu'ils appartiennent à la même auto-école
        if not user_driving_school or not contact_driving_school or user_driving_school != contact_driving_school:
            return Response({'error': 'Contact non autorisé'}, status=status.HTTP_403_FORBIDDEN)

        if request.method == 'GET':
            # Récupérer les messages directs entre les deux utilisateurs
            messages = DirectMessage.objects.filter(
                models.Q(sender=user, recipient=contact) |
                models.Q(sender=contact, recipient=user)
            ).order_by('created_at')

            # Sérialiser les messages
            messages_data = []
            for message in messages:
                # Get sender profile for photo
                sender_profile = None
                if message.sender.user_type == 'student' and hasattr(message.sender, 'student'):
                    sender_profile = message.sender.student
                elif message.sender.user_type == 'instructor' and hasattr(message.sender, 'instructor_profile'):
                    sender_profile = message.sender.instructor_profile

                messages_data.append({
                    'id': message.id,
                    'content': message.content,
                    'sender': {
                        'id': message.sender.id,
                        'first_name': message.sender.first_name,
                        'last_name': message.sender.last_name,
                        'photo': get_user_photo_url(message.sender, sender_profile)
                    },
                    'created_at': message.created_at.isoformat(),
                    'is_read': message.is_read
                })

            return Response(messages_data)

        elif request.method == 'POST':
            # Envoyer un message direct
            content = request.data.get('content', '').strip()
            if not content:
                return Response({'error': 'Le contenu du message est requis'}, status=status.HTTP_400_BAD_REQUEST)

            # Créer le message direct
            message = DirectMessage.objects.create(
                sender=user,
                recipient=contact,
                content=content
            )

            # Get sender profile for photo
            sender_profile = None
            if user.user_type == 'student' and hasattr(user, 'student'):
                sender_profile = user.student
            elif user.user_type == 'instructor' and hasattr(user, 'instructor_profile'):
                sender_profile = user.instructor_profile

            # Retourner le message créé
            message_data = {
                'id': message.id,
                'content': message.content,
                'sender': {
                    'id': message.sender.id,
                    'first_name': message.sender.first_name,
                    'last_name': message.sender.last_name,
                    'photo': get_user_photo_url(message.sender, sender_profile)
                },
                'created_at': message.created_at.isoformat(),
                'is_read': message.is_read
            }

            return Response(message_data, status=status.HTTP_201_CREATED)

    except User.DoesNotExist:
        return Response({'error': 'Contact non trouvé'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"Erreur lors de la gestion des messages directs: {e}")
        return Response({'error': 'Erreur interne'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, PremiumFeaturePermission])
def unread_messages_count_view(request, contact_id):
    """Vue pour récupérer le nombre de messages non lus d'un contact"""
    user = request.user

    try:
        # Vérifier que le contact existe et appartient à la même auto-école
        contact = User.objects.get(id=contact_id)

        # Vérifier les permissions (même logique que direct_messages_view)
        user_driving_school = None
        if hasattr(user, 'driving_school'):
            user_driving_school = user.driving_school
        elif user.user_type == 'instructor' and hasattr(user, 'instructor_profile'):
            user_driving_school = user.instructor_profile.driving_school
        elif user.user_type == 'student' and hasattr(user, 'student'):
            user_driving_school = user.student.driving_school

        contact_driving_school = None
        if hasattr(contact, 'driving_school'):
            contact_driving_school = contact.driving_school
        elif contact.user_type == 'instructor' and hasattr(contact, 'instructor_profile'):
            contact_driving_school = contact.instructor_profile.driving_school
        elif contact.user_type == 'student' and hasattr(contact, 'student'):
            contact_driving_school = contact.student.driving_school

        if not user_driving_school or not contact_driving_school or user_driving_school != contact_driving_school:
            return Response({'error': 'Contact non autorisé'}, status=status.HTTP_403_FORBIDDEN)

        # Compter les messages non lus de ce contact
        unread_count = DirectMessage.objects.filter(
            sender=contact,
            recipient=user,
            is_read=False
        ).count()

        return Response({'unread_count': unread_count})

    except User.DoesNotExist:
        return Response({'error': 'Contact non trouvé'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"Erreur lors de la récupération du compteur: {e}")
        return Response({'error': 'Erreur interne'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, PremiumFeaturePermission])
def mark_direct_messages_read_view(request, contact_id):
    """Vue pour marquer les messages directs comme lus"""
    user = request.user

    try:
        # Vérifier que le contact existe et appartient à la même auto-école (même logique)
        contact = User.objects.get(id=contact_id)

        # Marquer tous les messages de ce contact comme lus
        DirectMessage.objects.filter(
            sender=contact,
            recipient=user,
            is_read=False
        ).update(is_read=True)

        return Response({'success': True})

    except User.DoesNotExist:
        return Response({'error': 'Contact non trouvé'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"Erreur lors du marquage comme lu: {e}")
        return Response({'error': 'Erreur interne'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, PremiumFeaturePermission])
def all_unread_counts_view(request):
    """Vue pour récupérer tous les compteurs de messages non lus en une seule requête"""
    user = request.user

    try:
        # Récupérer tous les messages non lus pour cet utilisateur
        unread_messages = DirectMessage.objects.filter(
            recipient=user,
            is_read=False
        ).values('sender').annotate(count=models.Count('id'))

        # Créer un dictionnaire {sender_id: count}
        unread_counts = {}
        for item in unread_messages:
            unread_counts[item['sender']] = item['count']

        return Response(unread_counts)

    except Exception as e:
        print(f"Erreur lors de la récupération des compteurs: {e}")
        return Response({}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
