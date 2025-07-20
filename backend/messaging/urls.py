from django.urls import path
from . import views

app_name = 'messaging'

urlpatterns = [
    # Conversations
    path('conversations/', views.ConversationListCreateView.as_view(), name='conversation_list'),
    path('conversations/<int:pk>/', views.ConversationDetailView.as_view(), name='conversation_detail'),
    path('conversations/<int:conversation_id>/mark-read/', views.mark_messages_read_view, name='mark_read'),
    
    # Messages
    path('conversations/<int:conversation_id>/messages/', views.MessageListCreateView.as_view(), name='message_list'),
    path('conversations/<int:conversation_id>/messages/<int:pk>/', views.MessageDetailView.as_view(), name='message_detail'),
    
    # Statistiques
    path('unread-count/', views.unread_count_view, name='unread_count'),

    # Participants disponibles
    path('participants/', views.available_participants_view, name='available_participants'),

    # Messages directs (Messenger)
    path('direct/<int:contact_id>/', views.direct_messages_view, name='direct_messages'),
    path('direct/<int:contact_id>/unread-count/', views.unread_messages_count_view, name='unread_messages_count'),
    path('direct/<int:contact_id>/mark-read/', views.mark_direct_messages_read_view, name='mark_direct_messages_read'),

    # Compteurs globaux
    path('unread-counts/', views.all_unread_counts_view, name='all_unread_counts'),
]
