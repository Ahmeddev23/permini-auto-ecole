import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  UserIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { usePlanPermissions } from '../../hooks/usePlanPermissions';
import { messagingService } from '../../services/messagingService';
import websocketService from '../../services/websocketService';
import { useMessaging } from '../../contexts/MessagingContext';

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
  last_seen?: string;
}

interface MessengerSidebarProps {
  onContactSelect: (contact: Contact) => void;
  selectedContactId?: number;
  refreshTrigger?: number; // Pour déclencher le rafraîchissement des compteurs
}

const MessengerSidebar: React.FC<MessengerSidebarProps> = ({
  onContactSelect,
  selectedContactId,
  refreshTrigger
}) => {
  const { user } = useAuth();
  const { permissions } = usePlanPermissions();
  const { unreadCounts, forceRefresh } = useMessaging();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Vérifier si l'utilisateur a accès à la messagerie (plan premium)
  const hasMessagingAccess = permissions?.currentPlan === 'premium';

  // DEBUG TEMPORAIRE - Forcer l'accès pour tester
  const forceMessagingAccess = true;

  // Charger les contacts (simple, sans compteurs)
  const loadContacts = async (showLoading = true) => {
    if (!hasMessagingAccess && !forceMessagingAccess) {
      return;
    }

    try {
      if (showLoading) {
        setLoading(true);
      }

      // Charger seulement les contacts
      const contactsData = await messagingService.getAvailableParticipants();
      setContacts(contactsData);
    } catch (error: any) {
      console.error('❌ Erreur lors du chargement des contacts:', error);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  // Charger les contacts au démarrage (simple)
  useEffect(() => {
    loadContacts();
  }, [hasMessagingAccess, forceMessagingAccess]);

  // Les badges sont maintenant gérés par le contexte MessagingContext
  // Plus besoin d'écouter les WebSockets ici

  // Le polling est maintenant géré par le contexte MessagingContext

  // Filtrer les contacts selon la recherche
  const filteredContacts = contacts.filter(contact => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      contact.first_name.toLowerCase().includes(searchLower) ||
      contact.last_name.toLowerCase().includes(searchLower) ||
      contact.username.toLowerCase().includes(searchLower)
    );
  });

  const getUserTypeLabel = (userType: string) => {
    switch (userType) {
      case 'driving_school': return 'Auto-école';
      case 'instructor': return 'Moniteur';
      case 'student': return 'Candidat';
      default: return userType;
    }
  };

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case 'driving_school': return 'bg-blue-500';
      case 'instructor': return 'bg-green-500';
      case 'student': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  if (!hasMessagingAccess && !forceMessagingAccess) {
    return (
      <div className="w-72 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex items-center justify-center">
        <div className="text-center p-6">
          <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Messagerie disponible avec le plan Premium
          </p>
          <p className="text-xs text-red-500 mt-2">
            DEBUG: Connectez-vous d'abord !
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ x: 288, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="w-72 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Messagerie
        </h2>






        
        {/* Barre de recherche */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
          />
        </div>
      </div>

      {/* Liste des contacts */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Chargement...</p>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="p-4 text-center">
            <UserIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Aucun contact trouvé' : 'Aucun contact disponible'}
            </p>
          </div>
        ) : (
          <div className="p-2">
            {filteredContacts.map((contact) => (
              <motion.div
                key={contact.id}
                whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                onClick={() => {
                  // Forcer le refresh des compteurs et ouvrir la conversation
                  forceRefresh();
                  onContactSelect(contact);
                }}
                className={`
                  flex items-center p-3 rounded-lg cursor-pointer transition-colors
                  ${selectedContactId === contact.id 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }
                `}
              >
                {/* Avatar */}
                <div className="relative">
                  {getPhotoUrl(contact.photo) ? (
                    <img
                      src={getPhotoUrl(contact.photo)!}
                      alt={`${contact.first_name} ${contact.last_name}`}
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getPhotoUrl(contact.photo) ? 'hidden' : ''} ${getUserTypeColor(contact.user_type)}`}>
                    <span className="text-white font-medium text-sm">
                      {contact.first_name.charAt(0)}{contact.last_name.charAt(0)}
                    </span>
                  </div>
                  
                  {/* Indicateur en ligne */}
                  {contact.is_online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                  )}
                </div>

                {/* Informations */}
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {contact.first_name} {contact.last_name}
                    </p>

                    {/* Badge pour messages non lus */}
                    {unreadCounts[contact.id] > 0 && (
                      unreadCounts[contact.id] === 1 ? (
                        // Point rouge pour 1 message non lu
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      ) : (
                        // Badge avec nombre pour plusieurs messages
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center font-medium">
                          {unreadCounts[contact.id] > 99 ? '99+' : unreadCounts[contact.id]}
                        </span>
                      )
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-blue-600 dark:text-blue-400">
                      {getUserTypeLabel(contact.user_type)}
                    </span>
                    {contact.last_seen && !contact.is_online && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(contact.last_seen).toLocaleTimeString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MessengerSidebar;
