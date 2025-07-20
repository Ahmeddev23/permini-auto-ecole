import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

interface CardPaymentData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  amount: number;
  planId: string;
  isRenewal: boolean;
}

interface FlouciPaymentData {
  phoneNumber: string;
  amount: number;
  planId: string;
  isRenewal: boolean;
}

interface PaymentResponse {
  success: boolean;
  message: string;
  paymentUrl?: string;
  transactionId?: string;
  redirectUrl?: string;
}

class PaymentService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  async processCardPayment(data: CardPaymentData): Promise<PaymentResponse> {
    try {
      const response = await axios.post(`${API_URL}/payments/card/`, {
        card_number: data.cardNumber.replace(/\s/g, ''),
        expiry_date: data.expiryDate,
        cvv: data.cvv,
        cardholder_name: data.cardholderName,
        amount: data.amount,
        plan_id: data.planId,
        is_renewal: data.isRenewal
      }, {
        headers: this.getAuthHeaders()
      });

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors du paiement par carte');
    }
  }

  async processFlouciPayment(data: FlouciPaymentData): Promise<PaymentResponse> {
    try {
      const response = await axios.post(`${API_URL}/payments/flouci/`, {
        phone_number: data.phoneNumber,
        amount: data.amount,
        plan_id: data.planId,
        is_renewal: data.isRenewal
      }, {
        headers: this.getAuthHeaders()
      });

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors du paiement Flouci');
    }
  }

  async verifyPayment(transactionId: string): Promise<PaymentResponse> {
    try {
      const response = await axios.get(`${API_URL}/payments/verify/${transactionId}/`, {
        headers: this.getAuthHeaders()
      });

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la vérification du paiement');
    }
  }
}

export const paymentService = new PaymentService();
export type { CardPaymentData, FlouciPaymentData, PaymentResponse };
