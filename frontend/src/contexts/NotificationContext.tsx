import React, { createContext, useContext, useState, useEffect } from 'react';
import { notificationService, Notification } from '../services/notificationService';
import { useAuth } from './AuthContext';
import websocketService from '../services/websocketService';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  dismissNotification: (notificationId: number) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Load notifications
  const refreshNotifications = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const [notificationsData, count] = await Promise.all([
        notificationService.getNotifications(),
        notificationService.getUnreadCount()
      ]);
      
      setNotifications(notificationsData);
      setUnreadCount(count);
    } catch (error) {
      console.error('❌ Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: number) => {
    const success = await notificationService.markAsRead(notificationId);
    if (success) {
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true, read_at: new Date().toISOString() }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    const success = await notificationService.markAllAsRead();
    if (success) {
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);

    }
  };

  // Dismiss notification
  const dismissNotification = async (notificationId: number) => {
    const success = await notificationService.dismissNotification(notificationId);
    if (success) {
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      // Update unread count if the dismissed notification was unread
      const dismissedNotif = notifications.find(n => n.id === notificationId);
      if (dismissedNotif && !dismissedNotif.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

    }
  };

  // Load notifications on mount and user change
  useEffect(() => {
    if (user) {
      refreshNotifications();
    }
  }, [user]);

  // Listen to WebSocket for real-time notifications
  useEffect(() => {
    if (!user) return;

    const handleNewNotification = (data: any) => {
      if (data.notification) {

        
        // Add new notification to the list
        const newNotification: Notification = {
          id: data.notification.id,
          notification_type: data.notification.type,
          title: data.notification.title,
          message: data.notification.message,
          priority: data.notification.priority,
          is_read: false,
          is_dismissed: false,
          created_at: data.notification.created_at,
          icon: data.notification.icon,
          color_class: 'text-blue-500', // Default color
          time_ago: "À l'instant"
        };
        
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
      }
    };

    websocketService.on('notification_created', handleNewNotification);

    return () => {
      websocketService.off('notification_created', handleNewNotification);
    };
  }, [user]);



  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      refreshNotifications,
      markAsRead,
      markAllAsRead,
      dismissNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
