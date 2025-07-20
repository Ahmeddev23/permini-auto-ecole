import axios from 'axios';
import { User } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

// Configure axios defaults
axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add token to requests if available
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Token ${token}`;
}



export const authService = {
  // Login séparé pour auto-écoles
  async loginDrivingSchool(email: string, password: string) {
    try {
      // Créer une instance axios sans le token d'autorisation pour le login
      const loginAxios = axios.create({
        baseURL: API_URL,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await loginAxios.post('/auth/login/driving-school/', {
        email,
        password
      });

      const { token, user, driving_school } = response.data;

      // Store token in localStorage
      localStorage.setItem('token', token);

      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Token ${token}`;

      return { token, user, driving_school };
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erreur de connexion');
    }
  },

  // Login séparé pour candidats
  async loginStudent(email: string, password: string) {
    try {
      // Créer une instance axios sans le token d'autorisation pour le login
      const loginAxios = axios.create({
        baseURL: API_URL,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await loginAxios.post('/auth/login/student/', {
        email,
        password
      });

      const { token, user } = response.data;

      // Store token in localStorage
      localStorage.setItem('token', token);

      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Token ${token}`;

      return { token, user };
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erreur de connexion');
    }
  },

  // Login séparé pour moniteurs
  async loginInstructor(email: string, password: string) {
    try {
      // Créer une instance axios sans le token d'autorisation pour le login
      const loginAxios = axios.create({
        baseURL: API_URL,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await loginAxios.post('/auth/login/instructor/', {
        email,
        password
      });

      const { token, user } = response.data;

      // Store token in localStorage
      localStorage.setItem('token', token);

      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Token ${token}`;

      return { token, user };
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erreur de connexion');
    }
  },

  // Ancien login unifié (gardé pour compatibilité)
  async login(loginField: string, password: string) {
    try {
      const response = await axios.post('/auth/login/', {
        login: loginField,
        password
      });

      const { token, user, driving_school } = response.data;

      // Store token in localStorage
      localStorage.setItem('token', token);

      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Token ${token}`;

      return { token, user, driving_school };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur de connexion');
    }
  },

  async registerDrivingSchool(registrationData: any) {
    try {


      const response = await axios.post(`${API_URL}/auth/register/`, registrationData);

      // L'inscription ne retourne plus de token - vérification email requise
      return response.data;
    } catch (error: any) {
      console.error('Registration error:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'inscription');
    }
  },

  async sendVerificationCode(email: string) {
    try {
      const response = await axios.post(`${API_URL}/auth/send-verification-code/`, {
        email
      });

      return response.data;
    } catch (error: any) {
      console.error('Send verification code error:', error.response?.data);
      throw new Error(error.response?.data?.error || 'Erreur lors de l\'envoi du code');
    }
  },

  async verifyCodeBeforeRegistration(email: string, verificationCode: string) {
    try {
      const response = await axios.post(`${API_URL}/auth/verify-code/`, {
        email,
        verification_code: verificationCode
      });

      return response.data;
    } catch (error: any) {
      console.error('Code verification error:', error.response?.data);
      throw new Error(error.response?.data?.error || 'Erreur lors de la vérification');
    }
  },

  async verifyEmail(email: string, verificationCode: string) {
    try {
      const response = await axios.post(`${API_URL}/auth/verify-email/`, {
        email,
        verification_code: verificationCode
      });

      const { token, user } = response.data;

      // Store token in localStorage
      localStorage.setItem('token', token);

      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Token ${token}`;

      return { token, user };
    } catch (error: any) {
      console.error('Email verification error:', error.response?.data);
      throw new Error(error.response?.data?.error || 'Erreur lors de la vérification');
    }
  },

  async resendVerificationCode(email: string) {
    try {
      const response = await axios.post(`${API_URL}/auth/resend-verification/`, {
        email
      });

      return response.data;
    } catch (error: any) {
      console.error('Resend verification error:', error.response?.data);
      throw new Error(error.response?.data?.error || 'Erreur lors du renvoi du code');
    }
  },

  async uploadDocuments(cinDocument: File, legalDocuments: File) {
    try {
      const formData = new FormData();
      formData.append('cin_document', cinDocument);
      formData.append('legal_documents', legalDocuments);

      // Récupérer le token depuis localStorage
      const token = localStorage.getItem('token');

      const response = await axios.post(`${API_URL}/auth/upload-documents/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': token ? `Token ${token}` : '',
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('Document upload error:', error.response?.data);
      throw new Error(error.response?.data?.error || 'Erreur lors de l\'upload des documents');
    }
  },

  async getCurrentUser(): Promise<User> {
    try {
      const response = await axios.get(`${API_URL}/auth/profile/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du profil');
    }
  },

  async logout() {
    try {
      // Remove token from localStorage
      localStorage.removeItem('token');

      // Remove authorization header
      delete axios.defaults.headers.common['Authorization'];

      // Optional: Call logout endpoint if exists
      // await axios.post(`${API_URL}/auth/logout/`);
    } catch (error) {
      // Silent fail for logout
      console.error('Logout error:', error);
    }
  }
};