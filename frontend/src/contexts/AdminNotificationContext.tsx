import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { adminWebSocketService, AdminNotification } from '../services/adminWebSocketService';
import { toast } from 'react-hot-toast';

interface AdminNotificationContextType {
  notifications: AdminNotification[];
  unreadCount: number;
  loading: boolean;
  refreshNotifications: () => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  dismissNotification: (id: number) => void;
}

const AdminNotificationContext = createContext<AdminNotificationContextType | undefined>(undefined);

export const useAdminNotifications = () => {
  const context = useContext(AdminNotificationContext);
  if (context === undefined) {
    throw new Error('useAdminNotifications must be used within an AdminNotificationProvider');
  }
  return context;
};

interface AdminNotificationProviderProps {
  children: ReactNode;
}

export const AdminNotificationProvider: React.FC<AdminNotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [shownToasts, setShownToasts] = useState<Set<number>>(new Set());

  // Calculer le compteur de notifications non lues à partir de l'état actuel
  const unreadCount = notifications.filter(n => !n.is_read && !n.is_dismissed).length;

  // Charger les notifications depuis l'API
  const refreshNotifications = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      const { adminService } = await import('../services/adminService');
      const response = await adminService.getNotifications();

      // Mettre à jour les notifications en évitant les doublons
      setNotifications(prevNotifications => {
        const newNotifications = response.results || [];

        // Si c'est le premier chargement ou un refresh complet, remplacer tout
        if (prevNotifications.length === 0 || !silent) {
          return newNotifications;
        }

        // Sinon, fusionner en évitant les doublons
        const existingIds = new Set(prevNotifications.map(n => n.id));
        const uniqueNewNotifications = newNotifications.filter(n => !existingIds.has(n.id));

        if (uniqueNewNotifications.length > 0) {
          return [...uniqueNewNotifications, ...prevNotifications];
        }

        return prevNotifications;
      });

      // Le unreadCount est maintenant calculé automatiquement à partir des notifications


    } catch (error) {
      console.error('❌ Erreur lors du chargement des notifications admin:', error);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  // Marquer une notification comme lue
  const markAsRead = async (id: number) => {
    try {
      const { adminService } = await import('../services/adminService');
      await adminService.markNotificationAsRead(id);

      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id
            ? { ...notification, is_read: true }
            : notification
        )
      );

      // Le unreadCount sera automatiquement recalculé
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  };

  // Marquer toutes les notifications comme lues
  const markAllAsRead = async () => {
    try {
      const { adminService } = await import('../services/adminService');
      await adminService.markAllNotificationsAsRead();

      setNotifications(prev =>
        prev.map(notification => ({ ...notification, is_read: true }))
      );

      // Le unreadCount sera automatiquement recalculé (devrait être 0)
    } catch (error) {
      console.error('Erreur lors du marquage de toutes comme lues:', error);
    }
  };

  // Ignorer une notification
  const dismissNotification = async (id: number) => {
    try {
      const { adminService } = await import('../services/adminService');
      await adminService.dismissNotification(id);

      setNotifications(prev => prev.filter(notification => notification.id !== id));

      // Le unreadCount sera automatiquement recalculé
    } catch (error) {
      console.error('Erreur lors de l\'ignorance de la notification:', error);
    }
  };

  // Initialiser la connexion WebSocket
  useEffect(() => {
    const adminSession = localStorage.getItem('admin_session');
    if (!adminSession) {
      return;
    }

    // Charger les notifications initiales IMMÉDIATEMENT
    refreshNotifications();

    // Connecter le WebSocket pour les notifications en temps réel
    adminWebSocketService.connect();

    // Écouter les nouvelles notifications
    const handleNewNotification = (data: any) => {
      if (data.notification) {
        // Vérifier si la notification existe déjà pour éviter les doublons
        setNotifications(prev => {
          const exists = prev.some(notif => notif.id === data.notification.id);
          if (exists) {
            return prev;
          }
          return [data.notification, ...prev];
        });

        // Le unreadCount sera automatiquement recalculé

        // Afficher une toast notification seulement si pas déjà affichée
        setShownToasts(prev => {
          if (!prev.has(data.notification.id)) {
            toast.success(`Nouvelle notification: ${data.notification.title}`);
            return new Set([...prev, data.notification.id]);
          }
          return prev;
        });
      }
    };

    adminWebSocketService.on('admin_notification', handleNewNotification);

    return () => {
      adminWebSocketService.off('admin_notification', handleNewNotification);
      adminWebSocketService.disconnect();
    };
  }, []);



  return (
    <AdminNotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      refreshNotifications,
      markAsRead,
      markAllAsRead,
      dismissNotification
    }}>
      {children}
    </AdminNotificationContext.Provider>
  );
};
