import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../../contexts/NotificationContext';
import { Notification } from '../../services/notificationService';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose }) => {
  const { notifications, loading, markAsRead, markAllAsRead, dismissNotification } = useNotifications();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  const handleDismiss = async (notificationId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    await dismissNotification(notificationId);
  };

  const unreadNotifications = notifications.filter(n => !n.is_read);
  const readNotifications = notifications.filter(n => n.is_read);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notifications
              </h3>
              {unreadNotifications.length > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Tout marquer comme lu
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                Chargement...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                Aucune notification
              </div>
            ) : (
              <div>
                {/* Unread notifications */}
                {unreadNotifications.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-700">
                      Non lues ({unreadNotifications.length})
                    </div>
                    {unreadNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onClick={() => handleNotificationClick(notification)}
                        onDismiss={(e) => handleDismiss(notification.id, e)}
                      />
                    ))}
                  </div>
                )}

                {/* Read notifications */}
                {readNotifications.length > 0 && (
                  <div>
                    <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-700">
                      Lues
                    </div>
                    {readNotifications.slice(0, 5).map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onClick={() => handleNotificationClick(notification)}
                        onDismiss={(e) => handleDismiss(notification.id, e)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <button className="w-full text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-center">
                Voir toutes les notifications
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
  onDismiss: (event: React.MouseEvent) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClick, onDismiss }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500';
      case 'high': return 'border-l-orange-500';
      case 'medium': return 'border-l-blue-500';
      case 'low': return 'border-l-gray-400';
      default: return 'border-l-blue-500';
    }
  };

  return (
    <div
      className={`p-4 border-l-4 ${getPriorityColor(notification.priority)} hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
        !notification.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">{notification.icon}</span>
            <p className={`text-sm font-medium ${!notification.is_read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
              {notification.title}
            </p>
            {!notification.is_read && (
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {notification.message}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
            {notification.time_ago}
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown;
