import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

interface Coupon {
  id: number;
  code: string;
  name: string;
  description: string;
  discount_percentage: number;
  valid_from: string;
  valid_until: string;
  max_uses: number;
  current_uses: number;
  remaining_uses: number;
  status: 'active' | 'inactive' | 'expired' | 'used_up';
  is_valid: boolean;
  can_be_used: boolean;
  created_by_name: string;
  created_at: string;
}

interface CouponFormData {
  code: string;
  name: string;
  description: string;
  discount_percentage: number;
  valid_from: string;
  valid_until: string;
  max_uses: number;
  status: 'active' | 'inactive';
}

class CouponService {
  private getAuthHeaders() {
    const adminSession = localStorage.getItem('admin_session');
    if (adminSession) {
      const session = JSON.parse(adminSession);
      return {
        'Authorization': `AdminSession ${session.session_key}`,
        'Content-Type': 'application/json'
      };
    }
    throw new Error('Session admin non trouvée');
  }

  async getCoupons(params?: { search?: string; status?: string }): Promise<{ results: Coupon[]; count: number }> {
    try {
      const response = await axios.get(`${API_URL}/admin/coupons/`, {
        headers: this.getAuthHeaders(),
        params
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors du chargement des coupons');
    }
  }

  async createCoupon(data: CouponFormData): Promise<Coupon> {
    try {
      // Convertir les dates au format ISO
      const formattedData = {
        ...data,
        valid_from: new Date(data.valid_from).toISOString(),
        valid_until: new Date(data.valid_until).toISOString()
      };


      const response = await axios.post(`${API_URL}/admin/coupons/`, formattedData, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      console.error('Erreur détaillée:', error.response?.data);
      throw new Error(error.response?.data?.message || JSON.stringify(error.response?.data) || 'Erreur lors de la création du coupon');
    }
  }

  async updateCoupon(id: number, data: CouponFormData): Promise<Coupon> {
    try {
      // Convertir les dates au format ISO
      const formattedData = {
        ...data,
        valid_from: new Date(data.valid_from).toISOString(),
        valid_until: new Date(data.valid_until).toISOString()
      };


      const response = await axios.put(`${API_URL}/admin/coupons/${id}/`, formattedData, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      console.error('Erreur détaillée modification:', error.response?.data);
      throw new Error(error.response?.data?.message || JSON.stringify(error.response?.data) || 'Erreur lors de la modification du coupon');
    }
  }

  async deleteCoupon(id: number): Promise<void> {
    try {
      await axios.delete(`${API_URL}/admin/coupons/${id}/`, {
        headers: this.getAuthHeaders()
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression du coupon');
    }
  }

  async validateCoupon(code: string): Promise<{ valid: boolean; coupon?: Coupon; message?: string; errors?: any }> {
    try {
      const response = await axios.post(`${API_URL}/admin/coupons/validate/`, { code }, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      return {
        valid: false,
        errors: error.response?.data?.errors,
        message: error.response?.data?.message || 'Erreur lors de la validation'
      };
    }
  }

  // Validation publique pour les paiements
  async validateCouponPublic(code: string): Promise<{ valid: boolean; discount_percentage?: number; code?: string; name?: string; message?: string; errors?: any }> {
    try {
      const response = await axios.post(`${API_URL}/coupons/validate/`, { code });
      return response.data;
    } catch (error: any) {
      return {
        valid: false,
        errors: error.response?.data?.errors,
        message: error.response?.data?.message || 'Erreur lors de la validation'
      };
    }
  }
}

export const couponService = new CouponService();
export type { Coupon, CouponFormData };
