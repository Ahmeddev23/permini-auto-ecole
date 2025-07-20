class AdminWebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private listeners: { [key: string]: Function[] } = {};
  private isConnecting = false;

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {

      return;
    }

    // Vérifier la session admin
    const adminSession = localStorage.getItem('admin_session');
    if (!adminSession) {

      return;
    }



    this.isConnecting = true;
    const wsUrl = `ws://127.0.0.1:8000/ws/admin-notifications/`;


    
    try {
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {

        this.isConnecting = false;
        this.reconnectAttempts = 0;
        
        // Envoyer un ping pour maintenir la connexion
        this.sendPing();
        
        // Programmer des pings réguliers
        setInterval(() => {
          if (this.ws?.readyState === WebSocket.OPEN) {
            this.sendPing();
          }
        }, 30000); // Ping toutes les 30 secondes
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          
          if (data.type && this.listeners[data.type]) {
            this.listeners[data.type].forEach(callback => {
              try {
                callback(data);
              } catch (error) {
                console.error('❌ Erreur dans le callback WebSocket:', error);
              }
            });
          }
        } catch (error) {
          console.error('❌ Erreur parsing message WebSocket:', error);
        }
      };

      this.ws.onclose = (event) => {

        this.isConnecting = false;
        this.ws = null;
        
        // Tentative de reconnexion automatique
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;

          
          setTimeout(() => {
            this.connect();
          }, this.reconnectInterval * this.reconnectAttempts);
        } else {
          console.error('❌ Nombre maximum de tentatives de reconnexion atteint');
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ Erreur WebSocket admin:', error);
        this.isConnecting = false;
      };

    } catch (error) {
      console.error('❌ Erreur lors de la création du WebSocket admin:', error);
      this.isConnecting = false;
    }
  }

  disconnect() {
    if (this.ws) {

      this.ws.close();
      this.ws = null;
    }
    this.listeners = {};
    this.reconnectAttempts = 0;
    this.isConnecting = false;
  }

  private sendPing() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'ping',
        timestamp: new Date().toISOString()
      }));
    }
  }

  on(eventType: string, callback: Function) {
    if (!this.listeners[eventType]) {
      this.listeners[eventType] = [];
    }
    this.listeners[eventType].push(callback);
  }

  off(eventType: string, callback: Function) {
    if (this.listeners[eventType]) {
      this.listeners[eventType] = this.listeners[eventType].filter(cb => cb !== callback);
    }
  }

  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {

    }
  }

  getConnectionState() {
    if (!this.ws) return 'DISCONNECTED';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'CONNECTING';
      case WebSocket.OPEN:
        return 'CONNECTED';
      case WebSocket.CLOSING:
        return 'CLOSING';
      case WebSocket.CLOSED:
        return 'DISCONNECTED';
      default:
        return 'UNKNOWN';
    }
  }
}

// Instance singleton
export const adminWebSocketService = new AdminWebSocketService();

// Types pour les notifications admin
export interface AdminNotification {
  id: number;
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  icon: string;
  color_class: string;
  created_at: string;
  related_driving_school_id?: string;
  related_payment_id?: string;
  related_user_id?: number;
}
