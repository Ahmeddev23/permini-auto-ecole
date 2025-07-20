import React, { createContext, useContext, useState, useEffect } from 'react';
import { messagingService } from '../services/messagingService';
import { usePlanPermissions } from '../hooks/usePlanPermissions';
import { useAuth } from './AuthContext';
import websocketService from '../services/websocketService';

interface MessagingContextType {
  unreadCounts: Record<number, number>;
  updateUnreadCount: (contactId: number, count: number) => void;
  markAsRead: (contactId: number) => void;
  incrementUnread: (contactId: number) => void;
  refreshCounts: () => Promise<void>;
  forceRefresh: () => Promise<void>;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export const MessagingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>({});
  const { user } = useAuth();
  const permissions = usePlanPermissions();

  // Vérifier si l'utilisateur a accès à la messagerie (plan premium)
  const hasMessagingAccess = permissions?.currentPlan === 'premium';

  // Charger les compteurs initiaux
  const refreshCounts = async () => {
    if (!user) {
      return;
    }

    try {
      const counts = await messagingService.getAllUnreadCounts();
      setUnreadCounts(counts);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des compteurs:', error);
    }
  };

  // Forcer le rechargement (ignore les permissions)
  const forceRefresh = async () => {
    if (!user) {
      return;
    }

    try {
      const counts = await messagingService.getAllUnreadCounts();
      setUnreadCounts(counts);
    } catch (error) {
      console.error('❌ Erreur lors du force refresh des compteurs:', error);
    }
  };

  // Mettre à jour un compteur spécifique
  const updateUnreadCount = (contactId: number, count: number) => {
    setUnreadCounts(prev => ({
      ...prev,
      [contactId]: Math.max(0, count)
    }));
  };

  // Marquer comme lu (remettre à 0)
  const markAsRead = (contactId: number) => {
    updateUnreadCount(contactId, 0);
  };

  // Incrémenter le compteur
  const incrementUnread = (contactId: number) => {
    setUnreadCounts(prev => {
      const newCount = (prev[contactId] || 0) + 1;
      return {
        ...prev,
        [contactId]: newCount
      };
    });
  };

  // Charger les compteurs au démarrage
  useEffect(() => {
    // Attendre que les permissions soient chargées
    if (!permissions) {
      return;
    }

    // Bypass temporaire : forcer le chargement si l'utilisateur existe
    if (!user) {
      return;
    }

    // Charger les compteurs initiaux une seule fois
    refreshCounts();

    // Écouter les WebSockets pour les mises à jour temps réel
    const handleNewMessage = (data: any) => {
      if (data.message && data.message.sender && data.message.recipient) {
        const message = data.message;

        // Vérifier si c'est un message reçu (pas envoyé par moi) et destiné à moi
        if (message.sender.id !== user.id && message.recipient.id === user.id) {
          // Nouveau message reçu d'un autre utilisateur
          incrementUnread(message.sender.id);
        }
      }
    };

    const handleMessageSent = (data: any) => {
      // Message envoyé, pas besoin de changer les compteurs
    };

    const handleMessagesRead = (data: any) => {
      // Messages marqués comme lus
      if (data.sender_id) {
        markAsRead(data.sender_id);
      }
    };

    websocketService.on('new_message', handleNewMessage);
    websocketService.on('message_sent', handleMessageSent);
    websocketService.on('messages_read', handleMessagesRead);

    return () => {
      websocketService.off('new_message', handleNewMessage);
      websocketService.off('message_sent', handleMessageSent);
      websocketService.off('messages_read', handleMessagesRead);
    };
  }, [hasMessagingAccess, user]);

  return (
    <MessagingContext.Provider value={{
      unreadCounts,
      updateUnreadCount,
      markAsRead,
      incrementUnread,
      refreshCounts,
      forceRefresh
    }}>
      {children}
    </MessagingContext.Provider>
  );
};

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (context === undefined) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
};
