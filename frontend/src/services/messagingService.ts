import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Fonction pour s'assurer que le token d'authentification est présent
const ensureAuthToken = () => {
  const token = localStorage.getItem('token');
  if (token && !axios.defaults.headers.common['Authorization']) {
    axios.defaults.headers.common['Authorization'] = `Token ${token}`;
  }
};

export interface Conversation {
  id: number;
  title?: string;
  is_group: boolean;
  participants: Participant[];
  last_message?: Message;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface Participant {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  user_type: 'driving_school' | 'instructor' | 'student';
  photo?: string;
}

export interface Message {
  id: number;
  conversation: number;
  sender: Participant;
  message_type: 'text' | 'file' | 'image' | 'system';
  content?: string;
  file_attachment?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateConversationData {
  participant_ids: number[];
  title?: string;
  is_group?: boolean;
}

export interface CreateMessageData {
  content?: string;
  message_type?: 'text' | 'file' | 'image';
  file_attachment?: File;
}

class MessagingService {
  // Conversations
  async getConversations(): Promise<{ results: Conversation[]; count: number }> {
    try {
      ensureAuthToken();
      const response = await axios.get(`${API_URL}/messaging/conversations/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erreur lors de la récupération des conversations');
    }
  }

  async getConversation(id: number): Promise<Conversation> {
    try {
      ensureAuthToken();
      const response = await axios.get(`${API_URL}/messaging/conversations/${id}/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erreur lors de la récupération de la conversation');
    }
  }

  async createConversation(data: CreateConversationData): Promise<Conversation> {
    try {
      ensureAuthToken();
      const response = await axios.post(`${API_URL}/messaging/conversations/`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erreur lors de la création de la conversation');
    }
  }

  // Messages
  async getMessages(conversationId: number): Promise<{ results: Message[]; count: number }> {
    try {
      ensureAuthToken();
      const response = await axios.get(`${API_URL}/messaging/conversations/${conversationId}/messages/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erreur lors de la récupération des messages');
    }
  }

  async sendMessage(conversationId: number, data: CreateMessageData): Promise<Message> {
    try {
      ensureAuthToken();
      
      if (data.file_attachment) {
        // Envoyer avec FormData pour les fichiers
        const formData = new FormData();
        if (data.content) formData.append('content', data.content);
        if (data.message_type) formData.append('message_type', data.message_type);
        formData.append('file_attachment', data.file_attachment);
        
        const response = await axios.post(
          `${API_URL}/messaging/conversations/${conversationId}/messages/`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        return response.data;
      } else {
        // Envoyer en JSON pour les messages texte
        const response = await axios.post(
          `${API_URL}/messaging/conversations/${conversationId}/messages/`,
          data
        );
        return response.data;
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erreur lors de l\'envoi du message');
    }
  }

  // Marquer comme lu
  async markMessagesAsRead(conversationId: number): Promise<void> {
    try {
      ensureAuthToken();
      await axios.post(`${API_URL}/messaging/conversations/${conversationId}/mark-read/`);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erreur lors du marquage comme lu');
    }
  }

  // Compteur de messages non lus
  async getUnreadCount(): Promise<{ unread_count: number }> {
    try {
      ensureAuthToken();
      const response = await axios.get(`${API_URL}/messaging/unread-count/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erreur lors de la récupération du compteur');
    }
  }

  // Obtenir les participants disponibles (membres de l'auto-école)
  async getAvailableParticipants(): Promise<Participant[]> {
    try {
      ensureAuthToken();
      const response = await axios.get(`${API_URL}/messaging/participants/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erreur lors de la récupération des participants');
    }
  }

  // Messages directs (pour le système Messenger)
  async getDirectMessages(contactId: number) {
    try {
      ensureAuthToken();
      const response = await axios.get(`${API_URL}/messaging/direct/${contactId}/`);
      return response.data;
    } catch (error: any) {
      console.error('❌ API Error:', error.response?.status, error.response?.data);
      throw new Error('Erreur lors de la récupération des messages directs');
    }
  }

  async sendDirectMessage(contactId: number, messageData: { content: string }) {
    try {
      ensureAuthToken();
      const response = await axios.post(`${API_URL}/messaging/direct/${contactId}/`, messageData);
      return response.data;
    } catch (error: any) {
      console.error('❌ API Error:', error.response?.status, error.response?.data);
      throw new Error('Erreur lors de l\'envoi du message direct');
    }
  }

  async getUnreadMessagesCount(contactId: number): Promise<number> {
    try {
      ensureAuthToken();
      const response = await axios.get(`${API_URL}/messaging/direct/${contactId}/unread-count/`);
      return response.data.unread_count || 0;
    } catch (error: any) {
      console.error('❌ API Error:', error.response?.status, error.response?.data);
      return 0; // En cas d'erreur, retourner 0
    }
  }

  async markDirectMessagesAsRead(contactId: number) {
    try {
      ensureAuthToken();
      const response = await axios.post(`${API_URL}/messaging/direct/${contactId}/mark-read/`);
      return response.data;
    } catch (error: any) {
      console.error('❌ API Error:', error.response?.status, error.response?.data);
      throw new Error('Erreur lors du marquage des messages comme lus');
    }
  }

  // Récupérer tous les compteurs de messages non lus en une seule requête
  async getAllUnreadCounts(): Promise<Record<number, number>> {
    try {
      ensureAuthToken();

      try {
        const response = await axios.get(`${API_URL}/messaging/unread-counts/`);
        return response.data;
      } catch (globalError) {
        // Fallback : récupérer les participants et leurs compteurs individuellement
        const participants = await this.getAvailableParticipants();
        const counts: Record<number, number> = {};

        for (const participant of participants) {
          try {
            const count = await this.getUnreadMessagesCount(participant.id);
            if (count > 0) {
              counts[participant.id] = count;
            }
          } catch (error) {
            // Ignorer les erreurs individuelles
          }
        }

        return counts;
      }
    } catch (error: any) {
      console.error('❌ API Error:', error.response?.status, error.response?.data);
      return {};
    }
  }
}

export const messagingService = new MessagingService();
export default messagingService;
