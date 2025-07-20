import { useState, useEffect } from 'react';
import { messagingService } from '../services/messagingService';
import { usePlanPermissions } from './usePlanPermissions';
import { useAuth } from '../contexts/AuthContext';
import websocketService from '../services/websocketService';

export const useUnreadMessagesCount = () => {
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const { user } = useAuth();
  const permissions = usePlanPermissions();
  
  // Vérifier si l'utilisateur a accès à la messagerie (plan premium)
  const hasMessagingAccess = permissions?.currentPlan === 'premium';

  useEffect(() => {
    if (!hasMessagingAccess || !user) return;

    const fetchUnreadCount = async () => {
      try {
        const unreadCounts = await messagingService.getAllUnreadCounts();
        const total = Object.values(unreadCounts).reduce((sum: number, count: any) => sum + count, 0);
        setTotalUnreadCount(total);
      } catch (error) {
        console.error('Erreur lors du chargement du compteur total:', error);
        setTotalUnreadCount(0);
      }
    };

    // Charger le compteur initial
    fetchUnreadCount();

    // Écouter les nouveaux messages via WebSocket
    const handleNewMessage = () => {
      // Recharger les compteurs quand un nouveau message arrive
      fetchUnreadCount();
    };

    const handleMessageSent = () => {
      // Recharger les compteurs quand un message est envoyé
      fetchUnreadCount();
    };

    websocketService.on('new_message', handleNewMessage);
    websocketService.on('message_sent', handleMessageSent);

    return () => {
      websocketService.off('new_message', handleNewMessage);
      websocketService.off('message_sent', handleMessageSent);
    };
  }, [hasMessagingAccess, user]);

  return {
    totalUnreadCount,
    hasMessagingAccess
  };
};
