import axios from 'axios';
import { Student, StudentCreate, StudentUpdate, StudentStats } from '../types/student';
import { Instructor, InstructorCreate, InstructorUpdate, InstructorList, InstructorStats, InstructorSchedule } from '../types/instructor';
import { Vehicle, VehicleCreate, VehicleUpdate, VehicleList, VehicleStats } from '../types/vehicle';
import { Schedule, ScheduleList, ScheduleCreate, CalendarEvent, AvailabilityCheck } from '../types/schedule';
import { SupportTicketsResponse, SupportRequestData, SupportRequestResponse } from '../types/support';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

// Fonction pour s'assurer que le token d'authentification est présent
const ensureAuthToken = () => {
  const token = localStorage.getItem('token');
  if (token && !axios.defaults.headers.common['Authorization']) {
    axios.defaults.headers.common['Authorization'] = `Token ${token}`;
  }
};

// Types pour les statistiques du dashboard
export interface DashboardStats {
  total_students: number;
  active_students: number;
  total_instructors: number;
  total_vehicles: number;
  monthly_revenue: number;
  monthly_expenses: number;
  pending_payments: number;
  upcoming_exams: number;
}

export interface SubscriptionInfo {
  current_plan: 'free' | 'standard' | 'premium';
  plan_start_date: string;
  plan_end_date: string | null;
  days_remaining: number;
  max_accounts: number;
  current_accounts: number;
  can_upgrade: boolean;
}

export interface DrivingSchoolProfile {
  id: number;
  name: string;
  logo: string | null;
  manager_name: string;
  manager_photo: string | null;
  address: string;
  phone: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  current_plan: 'free' | 'standard' | 'premium';
  theme_color: string;
  dark_mode: boolean;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: number;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    photo: string | null;
  };
  // Informations personnelles
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  cin: string;
  photo?: string | null;
  date_of_birth: string;
  address: string;

  // Informations de formation
  license_type: 'A' | 'B' | 'C' | 'D';
  registration_date: string;
  formation_status: 'registered' | 'theory_in_progress' | 'theory_passed' | 'practical_in_progress' | 'practical_passed' | 'completed' | 'suspended';

  // Informations de paiement
  payment_type: 'fixed' | 'hourly';
  fixed_price?: number | null;
  hourly_rate?: number | null;
  total_amount?: number;
  paid_amount?: number;
  remaining_amount?: number;

  // Progression
  theory_hours_completed: number;
  practical_hours_completed: number;
  theory_exam_attempts: number;
  practical_exam_attempts: number;

  // Statut
  is_active: boolean;

  // Métadonnées
  created_at?: string;
  updated_at?: string;
}

export interface Instructor {
  id: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    photo: string | null;
  };
  cin: string;
  license_types: string;
  hire_date: string;
  salary: number | null;
  is_active: boolean;
}

export interface Vehicle {
  id: number;
  license_plate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  vehicle_type: 'A' | 'B' | 'C' | 'D';
  status: 'active' | 'maintenance' | 'inactive';
  current_mileage: number;
  technical_inspection_date: string;
  insurance_expiry_date: string;
  is_available: boolean;
  assigned_instructor: Instructor | null;
}

export interface Exam {
  id: number;
  student: Student;
  exam_type: 'theory' | 'practical_circuit' | 'practical_park';
  exam_date: string;
  location: string;
  result: 'pending' | 'passed' | 'failed' | 'absent';
  score: number | null;
  notes: string;
  examiner_notes: string;
}

export interface Payment {
  id: number;
  student: Student;
  amount: number;
  payment_date: string;
  payment_method: 'cash' | 'card' | 'transfer' | 'check';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  description: string;
  receipt_number: string;
}

class DashboardService {
  // Statistiques du dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await axios.get(`${API_URL}/driving-schools/dashboard/stats/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des statistiques');
    }
  }

  // Informations d'abonnement
  async getSubscriptionInfo(): Promise<SubscriptionInfo> {
    try {
      const response = await axios.get(`${API_URL}/driving-schools/subscription/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des informations d\'abonnement');
    }
  }

  // Profil de l'auto-école
  async getDrivingSchoolProfile(): Promise<DrivingSchoolProfile> {
    try {
      const response = await axios.get(`${API_URL}/driving-schools/profile/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du profil');
    }
  }

  // Candidats
  async getStudents(): Promise<Student[]> {
    try {
      const response = await axios.get(`${API_URL}/students/`);
      return response.data.results || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des candidats');
    }
  }

  async getStudent(id: number): Promise<Student> {
    try {
      const response = await axios.get(`${API_URL}/students/${id}/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du candidat');
    }
  }

  async createStudent(studentData: Partial<Student>): Promise<Student> {
    try {
      const response = await axios.post(`${API_URL}/students/`, studentData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la création du candidat');
    }
  }

  async updateStudent(id: number, studentData: Partial<Student>): Promise<Student> {
    try {
      const response = await axios.patch(`${API_URL}/students/${id}/`, studentData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du candidat');
    }
  }

  async updateStudentPhoto(id: number, formData: FormData): Promise<Student> {
    try {
      const response = await axios.patch(`${API_URL}/students/${id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour de la photo');
    }
  }

  async deleteStudent(id: number): Promise<void> {
    try {
      await axios.delete(`${API_URL}/students/${id}/`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression du candidat');
    }
  }

  async getStudentStats(id: number): Promise<any> {
    try {
      const response = await axios.get(`${API_URL}/students/${id}/stats/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des statistiques du candidat');
    }
  }

  // Validation en temps réel
  async validateEmail(email: string): Promise<{ valid: boolean; message: string }> {
    try {
      const response = await axios.post(`${API_URL}/students/validate-email/`, { email });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        return error.response.data;
      }
      throw new Error('Erreur lors de la validation de l\'email');
    }
  }

  async validateCin(cin: string): Promise<{ valid: boolean; message: string }> {
    try {
      const response = await axios.post(`${API_URL}/students/validate-cin/`, { cin });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        return error.response.data;
      }
      throw new Error('Erreur lors de la validation du CIN');
    }
  }

  // Véhicules
  async getVehicles(): Promise<Vehicle[]> {
    try {
      const response = await axios.get(`${API_URL}/vehicles/`);
      return response.data.results || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des véhicules');
    }
  }

  // Examens
  async getExams(): Promise<Exam[]> {
    try {
      const response = await axios.get(`${API_URL}/exams/`);
      return response.data.results || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des examens');
    }
  }

  // Paiements
  async getPayments(): Promise<Payment[]> {
    try {
      const response = await axios.get(`${API_URL}/payments/`);
      return response.data.results || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des paiements');
    }
  }

  // Examens à venir
  async getUpcomingExams(): Promise<Exam[]> {
    try {
      const response = await axios.get(`${API_URL}/exams/?upcoming=true`);
      return response.data.results || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des examens à venir');
    }
  }

  // Paiements en attente
  async getPendingPayments(): Promise<Payment[]> {
    try {
      const response = await axios.get(`${API_URL}/payments/?status=pending`);
      return response.data.results || response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des paiements en attente');
    }
  }

  // ==================== INSTRUCTORS ====================

  async getInstructors(): Promise<InstructorList[]> {
    try {
      ensureAuthToken();
      const response = await axios.get(`${API_URL}/instructors/`);

      // Gérer la pagination Django REST Framework
      const instructors = response.data.results || response.data;

      return Array.isArray(instructors) ? instructors : [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des moniteurs');
    }
  }

  // Récupérer les moniteurs avec leurs véhicules assignés pour le planning
  async getInstructorsWithVehicles(): Promise<InstructorList[]> {
    try {
      ensureAuthToken();
      const [instructorsResponse, vehiclesResponse] = await Promise.all([
        axios.get(`${API_URL}/instructors/`),
        axios.get(`${API_URL}/vehicles/`)
      ]);

      const instructors = instructorsResponse.data.results || instructorsResponse.data;
      const vehicles = vehiclesResponse.data.results || vehiclesResponse.data;

      // Mapper les moniteurs avec leurs véhicules assignés
      const instructorsWithVehicles = instructors.map((instructor: any) => {
        const assignedVehicle = vehicles.find((vehicle: any) =>
          vehicle.assigned_instructor === instructor.id
        );

        return {
          ...instructor,
          assigned_vehicle: assignedVehicle ? assignedVehicle.id : null
        };
      });

      return Array.isArray(instructorsWithVehicles) ? instructorsWithVehicles : [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des moniteurs');
    }
  }

  async getInstructor(id: number): Promise<Instructor> {
    try {
      const response = await axios.get(`${API_URL}/instructors/${id}/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du moniteur');
    }
  }

  async createInstructor(data: InstructorCreate): Promise<Instructor> {
    try {
      ensureAuthToken();
      const formData = new FormData();

      // Ajouter les champs de base
      formData.append('first_name', data.first_name);
      formData.append('last_name', data.last_name);
      formData.append('cin', data.cin);
      formData.append('phone', data.phone);
      formData.append('email', data.email);
      formData.append('hire_date', data.hire_date);

      // Ajouter les types de permis
      data.license_types.forEach(type => {
        formData.append('license_types', type);
      });

      // Ajouter le salaire si fourni
      if (data.salary !== undefined) {
        formData.append('salary', data.salary.toString());
      }

      // Ajouter la photo si fournie
      if (data.photo) {
        formData.append('photo', data.photo);
      }

      const response = await axios.post(`${API_URL}/instructors/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la création du moniteur');
    }
  }

  async updateInstructor(id: number, data: Partial<InstructorUpdate>): Promise<Instructor> {
    try {
      const response = await axios.patch(`${API_URL}/instructors/${id}/`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la modification du moniteur');
    }
  }

  async updateInstructorPhoto(id: number, formData: FormData): Promise<Instructor> {
    try {
      const response = await axios.patch(`${API_URL}/instructors/${id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour de la photo');
    }
  }

  async deleteInstructor(id: number): Promise<void> {
    try {
      await axios.delete(`${API_URL}/instructors/${id}/`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression du moniteur');
    }
  }

  async validateInstructorEmail(email: string) {
    try {
      const response = await axios.post(`${API_URL}/instructors/validate-email/`, { email });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la validation de l\'email');
    }
  }

  async validateInstructorCin(cin: string) {
    try {
      const response = await axios.post(`${API_URL}/instructors/validate-cin/`, { cin });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la validation du CIN');
    }
  }

  async getInstructorStats(id: number): Promise<InstructorStats> {
    try {
      const response = await axios.get(`${API_URL}/instructors/${id}/stats/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des statistiques');
    }
  }

  async getInstructorSchedule(id: number): Promise<InstructorSchedule[]> {
    try {
      const response = await axios.get(`${API_URL}/instructors/${id}/schedule/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du planning');
    }
  }

  // Vérification en temps réel pour les moniteurs
  async checkInstructorEmailExists(email: string): Promise<boolean> {
    try {
      const response = await axios.post(`${API_URL}/instructors/validate-email/`, { email });
      return !response.data.valid; // Inverser car valid=true signifie disponible
    } catch (error) {
      return false;
    }
  }

  async checkInstructorCinExists(cin: string): Promise<boolean> {
    try {
      const response = await axios.post(`${API_URL}/instructors/validate-cin/`, { cin });
      return !response.data.valid; // Inverser car valid=true signifie disponible
    } catch (error) {
      return false;
    }
  }

  // ==================== VEHICLES ====================
  async getVehicles(): Promise<VehicleList[]> {
    try {
      ensureAuthToken();
      const response = await axios.get(`${API_URL}/vehicles/`);
      // Gérer la pagination Django REST Framework
      const vehicles = response.data.results || response.data;
      return Array.isArray(vehicles) ? vehicles : [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des véhicules');
    }
  }

  async getVehicle(id: number): Promise<Vehicle> {
    try {
      ensureAuthToken();
      const response = await axios.get(`${API_URL}/vehicles/${id}/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du véhicule');
    }
  }

  async createVehicle(data: VehicleCreate): Promise<Vehicle> {
    try {
      ensureAuthToken();
      const response = await axios.post(`${API_URL}/vehicles/`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la création du véhicule');
    }
  }

  async updateVehicle(id: number, data: VehicleUpdate): Promise<Vehicle> {
    try {
      ensureAuthToken();
      const response = await axios.patch(`${API_URL}/vehicles/${id}/`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la modification du véhicule');
    }
  }

  async deleteVehicle(id: number): Promise<void> {
    try {
      ensureAuthToken();
      await axios.delete(`${API_URL}/vehicles/${id}/`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression du véhicule');
    }
  }

  async getAvailableVehicles(): Promise<VehicleList[]> {
    try {
      ensureAuthToken();
      const response = await axios.get(`${API_URL}/vehicles/available/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des véhicules disponibles');
    }
  }

  async getVehicleStats(id: number): Promise<VehicleStats> {
    try {
      ensureAuthToken();
      const response = await axios.get(`${API_URL}/vehicles/${id}/stats/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des statistiques du véhicule');
    }
  }

  async uploadVehiclePhoto(id: number, photo: File): Promise<Vehicle> {
    try {
      ensureAuthToken();
      const formData = new FormData();
      formData.append('photo', photo);

      const response = await axios.post(`${API_URL}/vehicles/${id}/upload-photo/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.vehicle;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'upload de la photo');
    }
  }

  async assignVehicleInstructor(vehicleId: number, instructorId: number | null): Promise<Vehicle> {
    try {
      ensureAuthToken();
      const response = await axios.post(`${API_URL}/vehicles/${vehicleId}/assign-instructor/`, {
        instructor_id: instructorId
      });
      return response.data.vehicle;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'assignation du moniteur');
    }
  }

  // ==================== SCHEDULES ====================
  async getSchedules(): Promise<ScheduleList[]> {
    try {
      ensureAuthToken();
      const response = await axios.get(`${API_URL}/schedules/`);
      // Gérer la pagination Django REST Framework
      const schedules = response.data.results || response.data;
      return Array.isArray(schedules) ? schedules : [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des plannings');
    }
  }

  // Récupérer les moniteurs + auto-école pour le planning
  async getInstructorsForSchedule(): Promise<InstructorList[]> {
    try {
      ensureAuthToken();
      const response = await axios.get(`${API_URL}/instructors/with-driving-school/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des moniteurs');
    }
  }

  async getSchedule(id: number): Promise<Schedule> {
    try {
      ensureAuthToken();
      const response = await axios.get(`${API_URL}/schedules/${id}/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du planning');
    }
  }

  async createSchedule(data: ScheduleCreate): Promise<Schedule> {
    try {
      ensureAuthToken();
      const response = await axios.post(`${API_URL}/schedules/`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la création du planning');
    }
  }

  async updateSchedule(id: number, data: Partial<ScheduleCreate>): Promise<Schedule> {
    try {
      ensureAuthToken();
      const response = await axios.patch(`${API_URL}/schedules/${id}/`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la modification du planning');
    }
  }

  async deleteSchedule(id: number): Promise<void> {
    try {
      ensureAuthToken();
      await axios.delete(`${API_URL}/schedules/${id}/`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression du planning');
    }
  }

  async updateScheduleStatus(id: number, status: string, cancellationReason?: string): Promise<Schedule> {
    try {
      ensureAuthToken();
      const response = await axios.post(`${API_URL}/schedules/${id}/status/`, {
        status,
        cancellation_reason: cancellationReason
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du statut');
    }
  }

  async getCalendarEvents(startDate: string, endDate: string): Promise<CalendarEvent[]> {
    try {
      ensureAuthToken();
      const response = await axios.get(`${API_URL}/schedules/calendar/`, {
        params: { start: startDate, end: endDate }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des événements du calendrier');
    }
  }

  async getStudentScheduleWithExams(studentId: number, startDate: string, endDate: string): Promise<any[]> {
    try {
      ensureAuthToken();
      const response = await axios.get(`${API_URL}/students/${studentId}/schedule-with-exams/`, {
        params: { start: startDate, end: endDate }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du planning avec examens');
    }
  }

  // Endpoint simple pour récupérer les séances d'un étudiant (sans examens)
  async getStudentSchedule(studentId: number): Promise<any[]> {
    try {
      ensureAuthToken();
      const response = await axios.get(`${API_URL}/students/${studentId}/schedule/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du planning');
    }
  }

  // Endpoint pour récupérer les examens d'un étudiant
  async getStudentExams(studentId: number): Promise<any[]> {
    try {
      ensureAuthToken();
      const response = await axios.get(`${API_URL}/students/${studentId}/exams/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des examens');
    }
  }

  async checkAvailability(data: AvailabilityCheck): Promise<{ available: boolean; conflicts?: any[] }> {
    try {
      ensureAuthToken();
      const response = await axios.post(`${API_URL}/schedules/check-availability/`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la vérification de disponibilité');
    }
  }

  // Méthodes pour les examens
  async getExams() {
    try {
      ensureAuthToken();
      const response = await axios.get(`${API_URL}/exams/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des examens');
    }
  }

  async getExam(id: number) {
    try {
      ensureAuthToken();

      const response = await axios.get(`${API_URL}/exams/${id}/`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Examen non trouvé ou non accessible');
      } else if (error.response?.status === 500) {
        throw new Error('Erreur serveur lors de la récupération de l\'examen');
      }

      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération de l\'examen');
    }
  }

  async createExam(examData: any) {
    try {
      ensureAuthToken();
      const response = await axios.post(`${API_URL}/exams/`, examData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la création de l\'examen');
    }
  }

  async updateExam(id: number, examData: any) {
    try {
      ensureAuthToken();

      const response = await axios.patch(`${API_URL}/exams/${id}/`, examData);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 500) {
        throw new Error('Erreur serveur lors de la mise à jour de l\'examen');
      }

      throw new Error('Erreur lors de la mise à jour de l\'examen');
    }
  }

  async deleteExam(id: number) {
    try {
      ensureAuthToken();
      const response = await axios.delete(`${API_URL}/exams/${id}/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression de l\'examen');
    }
  }

  async getExamStats() {
    try {
      ensureAuthToken();
      const response = await axios.get(`${API_URL}/exams/stats/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des statistiques d\'examens');
    }
  }

  // Méthodes pour les sessions d'examens
  async getExamSessions() {
    try {
      ensureAuthToken();
      const response = await axios.get(`${API_URL}/exams/sessions/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des sessions d\'examens');
    }
  }

  async createExamSession(sessionData: any) {
    try {
      ensureAuthToken();
      const response = await axios.post(`${API_URL}/exams/sessions/`, sessionData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la création de la session d\'examen');
    }
  }

  async registerForExam(sessionId: number, studentId: number, notes?: string) {
    try {
      ensureAuthToken();
      const response = await axios.post(`${API_URL}/exams/sessions/${sessionId}/register/`, {
        student_id: studentId,
        notes: notes || ''
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'inscription à l\'examen');
    }
  }

  // Méthodes pour les paiements
  async getPayments() {
    try {
      ensureAuthToken();
      const response = await axios.get(`${API_URL}/payments/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des paiements');
    }
  }

  async getPayment(id: number) {
    try {
      ensureAuthToken();
      const response = await axios.get(`${API_URL}/payments/${id}/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du paiement');
    }
  }

  async createPayment(paymentData: any) {
    try {
      ensureAuthToken();
      const response = await axios.post(`${API_URL}/payments/`, paymentData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la création du paiement');
    }
  }

  async updatePayment(id: number, paymentData: any) {
    try {
      ensureAuthToken();
      const response = await axios.patch(`${API_URL}/payments/${id}/`, paymentData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du paiement');
    }
  }

  async deletePayment(id: number) {
    try {
      ensureAuthToken();
      const response = await axios.delete(`${API_URL}/payments/${id}/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression du paiement');
    }
  }

  async markPaymentAsPaid(id: number) {
    try {
      ensureAuthToken();
      const response = await axios.post(`${API_URL}/payments/${id}/mark-paid/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du statut de paiement');
    }
  }

  async getPaymentStats() {
    try {
      ensureAuthToken();
      const response = await axios.get(`${API_URL}/payments/stats/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des statistiques de paiements');
    }
  }

  async getPaymentMethodsStats() {
    try {
      ensureAuthToken();
      const response = await axios.get(`${API_URL}/payments/methods-stats/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des statistiques par méthode de paiement');
    }
  }

  // Nouvelles méthodes pour le système de paiement simplifié
  async setupStudentPricing(studentId: number, data: any) {
    try {
      ensureAuthToken();
      const response = await axios.post(`${API_URL}/students/${studentId}/setup-pricing/`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erreur lors de la configuration de la tarification');
    }
  }

  async addStudentPayment(studentId: number, data: any) {
    try {
      ensureAuthToken();
      const response = await axios.post(`${API_URL}/students/${studentId}/add-payment/`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erreur lors de l\'ajout du paiement');
    }
  }

  async getPaymentLogs(studentId: number) {
    try {
      ensureAuthToken();
      const response = await axios.get(`${API_URL}/students/${studentId}/payment-logs/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erreur lors de la récupération de l\'historique');
    }
  }

  // Historique des candidats
  async getStudentPayments(studentId: number) {
    try {
      ensureAuthToken();
      const response = await axios.get(`${API_URL}/students/${studentId}/payments/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des paiements');
    }
  }

  async getStudentExams(studentId: number) {
    try {
      ensureAuthToken();
      const response = await axios.get(`${API_URL}/students/${studentId}/exams/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des examens');
    }
  }

  async getStudentSessions(studentId: number) {
    try {
      ensureAuthToken();
      const response = await axios.get(`${API_URL}/students/${studentId}/sessions/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des séances');
    }
  }

  // Statistiques du dashboard
  async getDashboardStats() {
    try {
      ensureAuthToken();
      const response = await axios.get(`${API_URL}/driving-schools/dashboard/stats/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des statistiques');
    }
  }

  // Récupérer tous les examens
  async getExams() {
    try {
      ensureAuthToken();
      const response = await axios.get(`${API_URL}/exams/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des examens');
    }
  }

  // Récupérer toutes les séances
  async getSchedules() {
    try {
      ensureAuthToken();
      const response = await axios.get(`${API_URL}/schedules/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des séances');
    }
  }

  // Récupérer le profil de l'auto-école
  async getDrivingSchoolProfile() {
    try {
      ensureAuthToken();
      const response = await axios.get(`${API_URL}/driving-schools/settings/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du profil');
    }
  }

  // Mettre à jour le profil de l'auto-école
  async updateDrivingSchoolProfile(formData: FormData) {
    try {
      ensureAuthToken();

      const response = await axios.put(`${API_URL}/driving-schools/settings/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.message ||
                          error.message ||
                          'Erreur lors de la mise à jour du profil';

      throw new Error(errorMessage);
    }
  }

  // Gestion des abonnements
  async getSubscriptionInfo() {
    try {
      ensureAuthToken();
      const response = await axios.get(`${API_URL}/driving-schools/subscription/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des informations d\'abonnement');
    }
  }

  // Informations d'abonnement pour les instructeurs (hérite du plan de l'auto-école)
  async getInstructorSubscriptionInfo() {
    try {
      ensureAuthToken();
      const response = await axios.get(`${API_URL}/instructors/subscription-info/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des informations d\'abonnement');
    }
  }

  // Statistiques du moniteur connecté
  async getMyInstructorStats(): Promise<InstructorStats> {
    try {
      ensureAuthToken();
      const response = await axios.get(`${API_URL}/instructors/my-stats/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération de vos statistiques');
    }
  }

  // Séances récentes pour le moniteur connecté (6 plus récentes)
  async getMyRecentSchedule(): Promise<ScheduleList[]> {
    try {
      ensureAuthToken();
      const response = await axios.get(`${API_URL}/instructors/my-recent-schedule/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération de vos séances récentes');
    }
  }

  // Informations de l'auto-école pour le moniteur connecté
  async getMyDrivingSchoolInfo() {
    try {
      ensureAuthToken();
      const response = await axios.get(`${API_URL}/instructors/my-driving-school-info/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des informations de l\'auto-école');
    }
  }

  // Informations de l'auto-école pour l'étudiant connecté
  async getMyStudentDrivingSchoolInfo() {
    try {
      ensureAuthToken();
      const response = await axios.get(`${API_URL}/students/my-driving-school-info/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des informations de l\'auto-école');
    }
  }

  // Informations d'abonnement pour les étudiants (hérite du plan de l'auto-école)
  async getStudentSubscriptionInfo() {
    try {
      ensureAuthToken();
      const response = await axios.get(`${API_URL}/students/subscription-info/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des informations d\'abonnement');
    }
  }

  async upgradePlan(planId: string) {
    try {
      ensureAuthToken();
      const response = await axios.post(`${API_URL}/driving-schools/upgrade-plan/`, {
        plan: planId
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à niveau du plan');
    }
  }

  async submitUpgradeRequest(formData: FormData) {
    try {
      ensureAuthToken();
      const response = await axios.post(`${API_URL}/driving-schools/upgrade-request/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la soumission de la demande');
    }
  }

  async getUpgradeRequests() {
    try {
      ensureAuthToken();
      const response = await axios.get(`${API_URL}/driving-schools/upgrade-requests/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des demandes');
    }
  }

  // Gestion des dépenses véhicules (Premium)
  async getVehicleExpenses() {
    try {
      ensureAuthToken();
      const response = await axios.get(`${API_URL}/driving-schools/vehicle-expenses/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des dépenses véhicules');
    }
  }

  async createVehicleExpense(formData: FormData) {
    try {
      ensureAuthToken();
      const response = await axios.post(`${API_URL}/driving-schools/vehicle-expenses/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la création de la dépense');
    }
  }

  // Gestion comptable (Premium)
  async getAccountingEntries(period: string = 'month') {
    try {
      ensureAuthToken();
      const response = await axios.get(`${API_URL}/driving-schools/accounting-entries/`, {
        params: { period }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des écritures comptables');
    }
  }

  async getFinancialSummary(period: string = 'month') {
    try {
      ensureAuthToken();
      const response = await axios.get(`${API_URL}/driving-schools/financial-summary/`, {
        params: { period }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du résumé financier');
    }
  }

  async createAccountingEntry(data: any) {
    try {
      ensureAuthToken();
      const response = await axios.post(`${API_URL}/driving-schools/accounting-entries/`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la création de l\'écriture comptable');
    }
  }

  // Les méthodes d'importation et de synchronisation ne sont plus nécessaires
  // car la synchronisation se fait automatiquement côté backend

  async updateVehicleDates(vehicleId: number, data: { insurance_expiry_date?: string; technical_inspection_date?: string }) {
    try {
      ensureAuthToken();
      const response = await axios.patch(`${API_URL}/vehicles/${vehicleId}/update-dates/`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour des dates du véhicule');
    }
  }

  // Historique des candidats
  async getStudentPayments(studentId: number) {
    try {
      ensureAuthToken();
      const response = await axios.get(`${API_URL}/students/${studentId}/payments/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des paiements');
    }
  }

  async getStudentExams(studentId: number) {
    try {
      ensureAuthToken();
      const response = await axios.get(`${API_URL}/students/${studentId}/exams/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des examens');
    }
  }

  async getStudentSessions(studentId: number) {
    try {
      ensureAuthToken();
      const response = await axios.get(`${API_URL}/students/${studentId}/sessions/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des séances');
    }
  }

  // Activités récentes
  async getRecentActivities() {
    try {
      ensureAuthToken();
      const response = await axios.get(`${API_URL}/driving-schools/recent-activities/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des activités récentes');
    }
  }

  // Événements à venir
  async getUpcomingEvents() {
    try {
      ensureAuthToken();
      const response = await axios.get(`${API_URL}/driving-schools/upcoming-events/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des événements à venir');
    }
  }

  // ==================== SUPPORT ====================

  async submitSupportRequest(data: SupportRequestData): Promise<SupportRequestResponse> {
    try {
      ensureAuthToken();
      const response = await axios.post(`${API_URL}/admin/support/submit/`, {
        subject: data.subject,
        message: data.message,
        priority: data.priority || 'medium'
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erreur lors de l\'envoi de la demande de support');
    }
  }

  async getSupportTickets(): Promise<SupportTicketsResponse> {
    try {
      ensureAuthToken();
      const response = await axios.get(`${API_URL}/admin/support/tickets/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erreur lors de la récupération des tickets');
    }
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;
