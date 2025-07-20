import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  PaperAirplaneIcon,
  MinusIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
// import { useMessaging } from '../../contexts/MessagingContext'; // Supprimé
import { messagingService } from '../../services/messagingService';
import websocketService from '../../services/websocketService';

// Helper function to get full photo URL
const getPhotoUrl = (photo?: string) => {
  if (!photo) return null;

  // If it's already a full URL, return as is
  if (photo.startsWith('http')) return photo;

  // Otherwise, prepend the API base URL
  const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';
  return `${API_BASE}${photo}`;
};

interface Contact {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  user_type: 'driving_school' | 'instructor' | 'student';
  photo?: string;
  is_online?: boolean;
}

interface Message {
  id: number;
  content: string;
  sender: {
    id: number;
    first_name: string;
    last_name: string;
    photo?: string;
  };
  created_at: string;
  is_read: boolean;
}

interface ChatBubbleProps {
  contact: Contact;
  onClose: () => void;
  onMinimize: () => void;
  isMinimized: boolean;
  position: { bottom: number; right: number };
  onMessageSent?: () => void; // Callback pour notifier qu'un message a été envoyé
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  contact,
  onClose,
  onMinimize,
  isMinimized,
  position,
  onMessageSent
}) => {
  const { user } = useAuth();
  // const { markAsRead } = useMessaging(); // Supprimé
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Charger les messages avec ce contact
  const loadMessages = async () => {
    try {
      setLoading(true);
      // Pour l'instant, on simule - il faudra créer un endpoint pour les messages directs
      const data = await messagingService.getDirectMessages(contact.id);
      setMessages(data);
    } catch (error: any) {
      console.error('Erreur lors du chargement des messages:', error);
      // En cas d'erreur, on initialise avec un tableau vide
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  // Envoyer un message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const messageContent = newMessage.trim();
      setNewMessage(''); // Vider le champ immédiatement

      // Essayer d'envoyer via WebSocket d'abord
      if (websocketService.isConnected()) {
        websocketService.sendMessage(contact.id, messageContent);
        // Le message sera ajouté via l'événement 'message_sent'
      } else {
        // Fallback vers API REST
        const message = await messagingService.sendDirectMessage(contact.id, {
          content: messageContent
        });

        // Ajouter le message immédiatement à l'interface
        setMessages(prev => [...prev, message]);
      }

      // Notifier que le message a été envoyé (pour mettre à jour les compteurs)
      if (onMessageSent) {
        onMessageSent();
      }

    } catch (error: any) {
      console.error('Erreur lors de l\'envoi du message:', error);
      // En cas d'erreur, remettre le message dans le champ
      setNewMessage(newMessage);
    } finally {
      setSending(false);
    }
  };

  // Faire défiler vers le bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    loadMessages();
    // Marquer les messages comme lus quand on ouvre la conversation
    markMessagesAsRead();
  }, [contact.id]);

  // Écouter les nouveaux messages en temps réel
  useEffect(() => {
    const handleNewMessage = (data: any) => {
      if (data.message && data.message.sender && data.message.recipient) {
        const message = data.message;

        // Vérifier si le message concerne cette conversation
        const isForThisConversation =
          (message.sender.id === contact.id && message.recipient.id === user?.id) ||
          (message.sender.id === user?.id && message.recipient.id === contact.id);

        if (isForThisConversation) {
          // Ajouter le nouveau message à la liste
          setMessages(prev => {
            // Éviter les doublons
            const exists = prev.some(m => m.id === message.id);
            if (exists) return prev;

            return [...prev, message];
          });

          // Si c'est un message reçu (pas envoyé par moi), marquer comme lu automatiquement
          if (message.sender.id === contact.id) {
            setTimeout(() => markMessagesAsRead(), 100);
          }
        }
      }
    };

    const handleMessageSent = (data: any) => {
      if (data.message && data.message.sender && data.message.recipient) {
        const message = data.message;

        // Vérifier si le message concerne cette conversation
        const isForThisConversation =
          (message.sender.id === contact.id && message.recipient.id === user?.id) ||
          (message.sender.id === user?.id && message.recipient.id === contact.id);

        if (isForThisConversation) {
          // Ajouter le message envoyé à la liste
          setMessages(prev => {
            // Éviter les doublons
            const exists = prev.some(m => m.id === message.id);
            if (exists) return prev;

            return [...prev, message];
          });
        }
      }
    };

    websocketService.on('new_message', handleNewMessage);
    websocketService.on('message_sent', handleMessageSent);

    return () => {
      websocketService.off('new_message', handleNewMessage);
      websocketService.off('message_sent', handleMessageSent);
    };
  }, [contact.id, user?.id]);

  // Marquer les messages comme lus (simple)
  const markMessagesAsRead = async () => {
    try {
      if (websocketService.isConnected()) {
        websocketService.markMessagesAsRead(contact.id);
      } else {
        await messagingService.markDirectMessagesAsRead(contact.id);
      }
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);



  const isMyMessage = (message: Message) => {
    return message.sender.id === user?.id;
  };

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case 'driving_school': return 'bg-blue-500';
      case 'instructor': return 'bg-green-500';
      case 'student': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: 1,
        height: isMinimized ? 60 : 400
      }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bg-white dark:bg-gray-800 rounded-t-lg shadow-2xl border border-gray-200 dark:border-gray-700 w-80 z-50"
      style={{
        bottom: position.bottom,
        right: position.right,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 rounded-t-lg">
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <div className="relative">
            {getPhotoUrl(contact.photo) ? (
              <img
                src={getPhotoUrl(contact.photo)!}
                alt={`${contact.first_name} ${contact.last_name}`}
                className="w-8 h-8 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getPhotoUrl(contact.photo) ? 'hidden' : ''} ${getUserTypeColor(contact.user_type)}`}>
              <span className="text-white font-medium text-xs">
                {contact.first_name.charAt(0)}{contact.last_name.charAt(0)}
              </span>
            </div>
            
            {/* Indicateur en ligne */}
            {contact.is_online && (
              <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 border border-white dark:border-gray-800 rounded-full"></div>
            )}
          </div>

          {/* Nom */}
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {contact.first_name} {contact.last_name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {contact.is_online ? 'En ligne' : 'Hors ligne'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-1">
          <button
            onClick={onMinimize}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
          >
            <MinusIcon className="h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Contenu du chat (caché si minimisé) */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 280, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex flex-col h-70"
            style={{ height: '280px' }}
          >
            {/* Messages */}
            <div className="flex-1 p-3 space-y-3 overflow-y-auto min-h-0" style={{ minHeight: '120px' }}>
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8">
                  <UserIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Aucun message encore
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Commencez la conversation !
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${isMyMessage(message) ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`
                        max-w-xs px-3 py-2 rounded-lg text-sm
                        ${isMyMessage(message)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        }
                      `}
                    >
                      <p>{message.content}</p>
                      <p className={`text-xs mt-1 ${isMyMessage(message) ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                        {new Date(message.created_at).toLocaleTimeString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Zone de saisie - fixée en bas */}
            <form onSubmit={handleSendMessage} className="flex-shrink-0 p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Tapez votre message..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PaperAirplaneIcon className="h-4 w-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ChatBubble;
