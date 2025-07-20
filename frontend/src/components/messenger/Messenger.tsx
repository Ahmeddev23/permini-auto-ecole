import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import MessengerSidebar from './MessengerSidebar';
import ChatBubble from './ChatBubble';

interface Contact {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  user_type: 'driving_school' | 'instructor' | 'student';
  photo?: string;
  is_online?: boolean;
  last_seen?: string;
  unread_count?: number;
}

interface OpenChat {
  contact: Contact;
  isMinimized: boolean;
}

const Messenger: React.FC = () => {
  const [selectedContactId, setSelectedContactId] = useState<number>();
  const [openChats, setOpenChats] = useState<OpenChat[]>([]);
  const [refreshContacts, setRefreshContacts] = useState(0);

  // Ouvrir un chat avec un contact
  const handleContactSelect = (contact: Contact) => {
    setSelectedContactId(contact.id);
    
    // Vérifier si le chat est déjà ouvert
    const existingChatIndex = openChats.findIndex(chat => chat.contact.id === contact.id);
    
    if (existingChatIndex >= 0) {
      // Si le chat existe, le dé-minimiser
      setOpenChats(prev => prev.map((chat, index) => 
        index === existingChatIndex 
          ? { ...chat, isMinimized: false }
          : chat
      ));
    } else {
      // Sinon, l'ajouter à la liste des chats ouverts
      setOpenChats(prev => [...prev, { contact, isMinimized: false }]);
    }
  };

  // Fermer un chat
  const handleCloseChat = (contactId: number) => {
    setOpenChats(prev => prev.filter(chat => chat.contact.id !== contactId));
    if (selectedContactId === contactId) {
      setSelectedContactId(undefined);
    }
  };

  // Minimiser/maximiser un chat
  const handleMinimizeChat = (contactId: number) => {
    setOpenChats(prev => prev.map(chat => 
      chat.contact.id === contactId 
        ? { ...chat, isMinimized: !chat.isMinimized }
        : chat
    ));
  };

  // Calculer la position des bulles de chat
  const getChatPosition = (index: number) => {
    const sidebarWidth = 288; // Largeur de la sidebar Messenger (w-72 = 288px)
    const baseRight = sidebarWidth + 20; // Marge de droite + largeur sidebar
    const chatWidth = 320; // Largeur d'une bulle + marge
    return {
      bottom: 80, // Augmenté pour que la zone de saisie soit plus visible
      right: baseRight + (index * chatWidth)
    };
  };

  // Fonction pour rafraîchir les compteurs de messages non lus
  const handleMessageSent = () => {
    setRefreshContacts(prev => prev + 1);
  };

  return (
    <>
      {/* Sidebar Messenger */}
      <MessengerSidebar
        onContactSelect={handleContactSelect}
        selectedContactId={selectedContactId}
        refreshTrigger={refreshContacts}
      />

      {/* Bulles de chat */}
      <AnimatePresence>
        {openChats.map((openChat, index) => (
          <ChatBubble
            key={openChat.contact.id}
            contact={openChat.contact}
            onClose={() => handleCloseChat(openChat.contact.id)}
            onMinimize={() => handleMinimizeChat(openChat.contact.id)}
            isMinimized={openChat.isMinimized}
            position={getChatPosition(index)}
            onMessageSent={handleMessageSent}
          />
        ))}
      </AnimatePresence>
    </>
  );
};

export default Messenger;
