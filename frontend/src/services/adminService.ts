import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/admin';

// Interface pour les réponses admin
interface AdminUser {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_superadmin: boolean;
  can_manage_driving_schools: boolean;
  can_manage_users: boolean;
  can_view_logs: boolean;
  can_manage_system: boolean;
  can_send_notifications: boolean;
  last_login: string;
  login_count: number;
}

interface AdminLoginResponse {
  message: string;
  admin_user: AdminUser;
  session_key: string;
  expires_at: string;
}

interface SystemStats {
  total_driving_schools: number;
  active_driving_schools: number;
  total_users: number;
  active_users: number;
  total_instructors: number;
  total_students: number;
  total_vehicles: number;
  upcoming_exams: number;
  new_registrations_today: number;
  new_registrations_week: number;
  pending_contact_forms: number;
  pending_payments: number;
  active_sessions: number;
  standard_schools: number;
  premium_schools: number;
  recent_logins: number;
  system_uptime: string;
  database_size: string;
  storage_used: string;
}

interface DrivingSchool {
  id: string;
  name: string;
  owner_name: string;
  owner_email: string;
  address: string;
  phone: string;
  email: string;
  status: string;
  current_plan: string;
  plan_start_date: string;
  plan_end_date: string;
  max_accounts: number;
  current_accounts: number;
  days_remaining: number;
  created_at: string;
}

interface ContactForm {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  assigned_to_name: string;
  admin_response: string;
  responded_at: string;
  responded_by_name: string;
  created_at: string;
}

interface AdminActionLog {
  id: string;
  admin_user_name: string;
  action_type: string;
  action_type_display: string;
  target_model: string;
  target_id: string;
  description: string;
  ip_address: string;
  created_at: string;
  metadata: any;
}

class AdminService {
  private getAuthHeaders() {
    const adminSession = localStorage.getItem('admin_session');
    if (adminSession) {
      const session = JSON.parse(adminSession);
      return {
        'Authorization': `AdminSession ${session.session_key}`,
        'Content-Type': 'application/json'
      };
    }
    return {
      'Content-Type': 'application/json'
    };
  }

  // Authentification
  async login(username: string, password: string): Promise<AdminLoginResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/login/`, {
        username,
        password
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur de connexion');
    }
  }

  async logout(): Promise<void> {
    try {
      await axios.post(`${API_URL}/auth/logout/`, {}, {
        headers: this.getAuthHeaders()
      });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      localStorage.removeItem('admin_session');
    }
  }

  async getCurrentUser(): Promise<AdminUser> {
    try {
      const response = await axios.get(`${API_URL}/auth/me/`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du profil');
    }
  }

  // Statistiques
  async getDashboardStats(): Promise<SystemStats> {
    try {
      const response = await axios.get(`${API_URL}/dashboard/stats/`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des statistiques');
    }
  }

  // Gestion des utilisateurs
  async getUsers(params?: any): Promise<{ results: any[], count: number }> {
    try {
      const response = await axios.get(`${API_URL}/users/`, {
        headers: this.getAuthHeaders(),
        params
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des utilisateurs');
    }
  }

  async getUserById(id: string): Promise<any> {
    try {
      const response = await axios.get(`${API_URL}/users/${id}/`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération de l\'utilisateur');
    }
  }

  async createUser(data: any): Promise<any> {
    try {
      const response = await axios.post(`${API_URL}/users/`, data, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la création de l\'utilisateur');
    }
  }

  async updateUser(id: string, data: any): Promise<any> {
    try {
      const response = await axios.patch(`${API_URL}/users/${id}/`, data, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour de l\'utilisateur');
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}/users/${id}/`, {
        headers: this.getAuthHeaders()
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression de l\'utilisateur');
    }
  }

  async activateUser(id: string): Promise<void> {
    try {
      await axios.post(`${API_URL}/users/${id}/activate/`, {}, {
        headers: this.getAuthHeaders()
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'activation');
    }
  }

  async deactivateUser(id: string, reason: string): Promise<void> {
    try {
      await axios.post(`${API_URL}/users/${id}/deactivate/`, { reason }, {
        headers: this.getAuthHeaders()
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la désactivation');
    }
  }

  async resetUserPassword(id: string): Promise<{ new_password: string }> {
    try {
      const response = await axios.post(`${API_URL}/users/${id}/reset-password/`, {}, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la réinitialisation');
    }
  }

  // Gestion des auto-écoles
  async getDrivingSchools(params?: any): Promise<{ results: DrivingSchool[], count: number }> {
    try {
      const response = await axios.get(`${API_URL}/driving-schools/`, {
        headers: this.getAuthHeaders(),
        params
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des auto-écoles');
    }
  }

  async getDrivingSchool(id: string): Promise<DrivingSchool> {
    try {
      const response = await axios.get(`${API_URL}/driving-schools/${id}/`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération de l\'auto-école');
    }
  }

  async updateDrivingSchool(id: string, data: Partial<DrivingSchool>): Promise<DrivingSchool> {
    try {
      const response = await axios.patch(`${API_URL}/driving-schools/${id}/`, data, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  }

  async approveDrivingSchool(id: string): Promise<void> {
    try {
      await axios.post(`${API_URL}/driving-schools/${id}/approve/`, {}, {
        headers: this.getAuthHeaders()
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'approbation');
    }
  }

  async suspendDrivingSchool(id: string, reason: string): Promise<void> {
    try {
      await axios.post(`${API_URL}/driving-schools/${id}/suspend/`, { reason }, {
        headers: this.getAuthHeaders()
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suspension');
    }
  }

  async reactivateDrivingSchool(id: string): Promise<void> {
    try {
      await axios.post(`${API_URL}/driving-schools/${id}/reactivate/`, {}, {
        headers: this.getAuthHeaders()
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la réactivation');
    }
  }

  // Gestion des paiements
  async getPayments(params?: any): Promise<{ results: any[], count: number }> {
    try {
      const response = await axios.get(`${API_URL}/payments/`, {
        headers: this.getAuthHeaders(),
        params
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des paiements');
    }
  }

  async approvePayment(id: string, notes?: string): Promise<void> {
    try {
      await axios.post(`${API_URL}/payments/${id}/approve/`, { notes }, {
        headers: this.getAuthHeaders()
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Erreur lors de l\'approbation');
    }
  }

  async rejectPayment(id: string, reason: string): Promise<void> {
    try {
      await axios.post(`${API_URL}/payments/${id}/reject/`, { reason }, {
        headers: this.getAuthHeaders()
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Erreur lors du rejet');
    }
  }

  // Gestion des formulaires de contact
  async getContactForms(params?: any): Promise<{ results: ContactForm[], count: number }> {
    try {
      const response = await axios.get(`${API_URL}/contact-forms/`, {
        headers: this.getAuthHeaders(),
        params
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des formulaires');
    }
  }

  async updateContactForm(id: string, data: Partial<ContactForm>): Promise<ContactForm> {
    try {
      const response = await axios.patch(`${API_URL}/contact-forms/${id}/`, data, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  }

  // Logs d'actions
  async getActionLogs(params?: any): Promise<{ results: AdminActionLog[], count: number }> {
    try {
      const response = await axios.get(`${API_URL}/logs/`, {
        headers: this.getAuthHeaders(),
        params
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des logs');
    }
  }

  // Notifications système
  async sendSystemNotification(data: {
    title: string;
    message: string;
    target_audience: string;
    notification_type: string;
  }): Promise<void> {
    try {
      await axios.post(`${API_URL}/notifications/send/`, data, {
        headers: this.getAuthHeaders()
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'envoi de la notification');
    }
  }

  // Vérifier si l'utilisateur est connecté
  isAuthenticated(): boolean {
    const adminSession = localStorage.getItem('admin_session');
    if (!adminSession) return false;

    try {
      const session = JSON.parse(adminSession);
      const expiresAt = new Date(session.expires_at);
      return expiresAt > new Date();
    } catch {
      return false;
    }
  }

  // Obtenir les informations de session
  getSessionInfo() {
    const adminSession = localStorage.getItem('admin_session');
    if (adminSession) {
      return JSON.parse(adminSession);
    }
    return null;
  }

  // Récupérer les données pour les graphiques
  async getChartData(): Promise<any> {
    try {
      const response = await axios.get(`${API_URL}/dashboard/charts/`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors du chargement des graphiques');
    }
  }

  // ==================== NOTIFICATIONS ADMIN ====================

  async getNotifications(params?: { is_read?: boolean; type?: string }): Promise<any> {
    try {
      const response = await axios.get(`${API_URL}/notifications/`, {
        headers: this.getAuthHeaders(),
        params
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des notifications');
    }
  }

  async markNotificationAsRead(notificationId: number): Promise<any> {
    try {
      const response = await axios.put(`${API_URL}/notifications/${notificationId}/read/`, {}, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors du marquage comme lu');
    }
  }

  async markAllNotificationsAsRead(): Promise<any> {
    try {
      const response = await axios.put(`${API_URL}/notifications/mark-all-read/`, {}, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors du marquage de toutes comme lues');
    }
  }

  async dismissNotification(notificationId: number): Promise<any> {
    try {
      const response = await axios.delete(`${API_URL}/notifications/${notificationId}/dismiss/`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'ignorance de la notification');
    }
  }
}

export const adminService = new AdminService();
export type { AdminUser, SystemStats, DrivingSchool, ContactForm, AdminActionLog };
