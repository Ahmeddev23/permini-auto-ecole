class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private messageHandlers: Map<string, Function[]> = new Map();

  connect() {
    // Éviter les connexions multiples
    if (this.socket && (this.socket.readyState === WebSocket.CONNECTING || this.socket.readyState === WebSocket.OPEN)) {
      return;
    }

    // Fermer la connexion existante si elle existe
    if (this.socket) {
      this.socket.close();
    }

    try {
      // URL WebSocket (ws:// pour le développement, wss:// pour la production)
      // Pour l'instant, on utilise l'authentification par session Django
      const wsUrl = 'ws://127.0.0.1:8000/ws/messaging/';

      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        this.reconnectAttempts = 0;
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Gérer les différents types de messages
          if (data.type === 'connection_established') {
            this.authenticate();
          } else if (data.type === 'authenticated') {
            this.emit('connected');
          } else if (data.type === 'error') {
            console.error('❌ Erreur WebSocket:', data.message);
            if (data.message === 'Non authentifié') {
              setTimeout(() => this.authenticate(), 1000);
            }
          }

          this.emit(data.type, data);
        } catch (error) {
          console.error('Erreur lors du parsing du message WebSocket:', error);
        }
      };

      this.socket.onclose = (event) => {
        this.socket = null;
        this.emit('disconnected');

        // Ne se reconnecter que si ce n'est pas une fermeture intentionnelle
        if (event.code !== 1000) {
          this.handleReconnect();
        }
      };

      this.socket.onerror = (error) => {
        console.error('❌ Erreur WebSocket:', error);
        this.emit('error', error);
      };

    } catch (error) {
      console.error('Erreur lors de la connexion WebSocket:', error);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close(1000); // Code 1000 = fermeture normale
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;

      setTimeout(() => {
        this.connect();
      }, this.reconnectInterval);
    }
  }

  sendMessage(recipientId: number, content: string) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const message = {
        type: 'send_message',
        recipient_id: recipientId,
        content: content
      };
      
      this.socket.send(JSON.stringify(message));
    } else {
      throw new Error('WebSocket non connecté');
    }
  }

  markMessagesAsRead(senderId: number) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const message = {
        type: 'mark_read',
        sender_id: senderId
      };

      this.socket.send(JSON.stringify(message));
    }
  }

  // Système d'événements
  on(event: string, handler: Function) {
    if (!this.messageHandlers.has(event)) {
      this.messageHandlers.set(event, []);
    }
    this.messageHandlers.get(event)!.push(handler);
  }

  off(event: string, handler: Function) {
    const handlers = this.messageHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any) {
    const handlers = this.messageHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Erreur dans le handler ${event}:`, error);
        }
      });
    }
  }

  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  private authenticate() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        this.disconnect();
        return;
    }

    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        const authMessage = {
            type: 'authenticate',
            token: token
        };

        this.socket.send(JSON.stringify(authMessage));
    }
  }
}

// Instance singleton
export const websocketService = new WebSocketService();
export default websocketService;


