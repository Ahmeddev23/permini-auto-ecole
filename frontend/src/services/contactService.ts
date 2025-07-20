import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface ContactFormResponse {
  success: boolean;
  message: string;
  id: string;
}

class ContactService {
  /**
   * Envoyer un formulaire de contact depuis le site web
   */
  async submitContactForm(data: ContactFormData): Promise<ContactFormResponse> {
    try {
      const response = await axios.post(`${API_URL}/admin/public/contact/`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi du formulaire de contact:', error);
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error('Une erreur est survenue lors de l\'envoi de votre message. Veuillez réessayer.');
    }
  }

  /**
   * Valider les données du formulaire de contact
   */
  validateContactForm(data: ContactFormData): string[] {
    const errors: string[] = [];

    if (!data.name?.trim()) {
      errors.push('Le nom est requis');
    }

    if (!data.email?.trim()) {
      errors.push('L\'email est requis');
    } else if (!this.isValidEmail(data.email)) {
      errors.push('L\'email n\'est pas valide');
    }

    if (!data.subject?.trim()) {
      errors.push('Le sujet est requis');
    }

    if (!data.message?.trim()) {
      errors.push('Le message est requis');
    } else if (data.message.trim().length < 10) {
      errors.push('Le message doit contenir au moins 10 caractères');
    }

    if (data.phone && !this.isValidPhone(data.phone)) {
      errors.push('Le numéro de téléphone n\'est pas valide');
    }

    return errors;
  }

  /**
   * Valider un email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valider un numéro de téléphone
   */
  private isValidPhone(phone: string): boolean {
    // Accepter les formats tunisiens et internationaux
    const phoneRegex = /^(\+216|216)?[0-9]{8}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    return phoneRegex.test(cleanPhone);
  }

  /**
   * Formater un numéro de téléphone tunisien
   */
  formatTunisianPhone(phone: string): string {
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    if (cleanPhone.startsWith('+216')) {
      return cleanPhone;
    } else if (cleanPhone.startsWith('216')) {
      return `+${cleanPhone}`;
    } else if (cleanPhone.length === 8) {
      return `+216${cleanPhone}`;
    }
    
    return phone;
  }

  /**
   * Nettoyer les données du formulaire
   */
  sanitizeContactForm(data: ContactFormData): ContactFormData {
    return {
      name: data.name?.trim() || '',
      email: data.email?.trim().toLowerCase() || '',
      phone: data.phone ? this.formatTunisianPhone(data.phone.trim()) : '',
      subject: data.subject?.trim() || '',
      message: data.message?.trim() || '',
    };
  }
}

export const contactService = new ContactService();
export default contactService;
