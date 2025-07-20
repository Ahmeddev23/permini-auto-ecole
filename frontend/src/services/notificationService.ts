import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

// Ensure auth token is included in requests
const ensureAuthToken = () => {
  const token = localStorage.getItem('token');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Token ${token}`;
  }
};

export interface Notification {
  id: number;
  notification_type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  related_student_id?: number;
  related_instructor_id?: number;
  related_session_id?: number;
  related_vehicle_id?: number;
  related_payment_id?: number;
  is_read: boolean;
  is_dismissed: boolean;
  created_at: string;
  read_at?: string;
  icon: string;
  color_class: string;
  time_ago: string;
}

export const notificationService = {
  // Get all notifications for current user
  async getNotifications(isRead?: boolean): Promise<Notification[]> {
    try {
      ensureAuthToken();
      const params = isRead !== undefined ? { is_read: isRead } : {};
      const response = await axios.get(`${API_URL}/notifications/`, { params });
      return response.data.results || response.data;
    } catch (error: any) {
      console.error('❌ Error fetching notifications:', error.response?.status, error.response?.data);
      return [];
    }
  },

  // Get unread notifications count
  async getUnreadCount(): Promise<number> {
    try {
      ensureAuthToken();
      const response = await axios.get(`${API_URL}/notifications/unread-count/`);
      return response.data.count || 0;
    } catch (error: any) {
      console.error('❌ Error fetching unread count:', error.response?.status, error.response?.data);
      return 0;
    }
  },

  // Mark specific notification as read
  async markAsRead(notificationId: number): Promise<boolean> {
    try {
      ensureAuthToken();
      await axios.post(`${API_URL}/notifications/${notificationId}/read/`);
      return true;
    } catch (error: any) {
      console.error('❌ Error marking notification as read:', error.response?.status, error.response?.data);
      return false;
    }
  },

  // Mark all notifications as read
  async markAllAsRead(): Promise<boolean> {
    try {
      ensureAuthToken();
      await axios.post(`${API_URL}/notifications/mark-all-read/`);
      return true;
    } catch (error: any) {
      console.error('❌ Error marking all notifications as read:', error.response?.status, error.response?.data);
      return false;
    }
  },

  // Dismiss notification
  async dismissNotification(notificationId: number): Promise<boolean> {
    try {
      ensureAuthToken();
      await axios.post(`${API_URL}/notifications/${notificationId}/dismiss/`);
      return true;
    } catch (error: any) {
      console.error('❌ Error dismissing notification:', error.response?.status, error.response?.data);
      return false;
    }
  }
};
