export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: string;
  is_active: boolean;
  date_joined: string;
}

export interface Instructor {
  id: number;
  user: User;
  driving_school: number;
  driving_school_name: string;
  first_name: string;
  last_name: string;
  full_name: string;
  cin: string;
  phone: string;
  email: string;
  photo?: string;
  license_types: string; // Types de permis séparés par des virgules
  hire_date: string;
  salary?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InstructorCreate {
  first_name: string;
  last_name: string;
  cin: string;
  phone: string;
  email: string;
  photo?: File;
  license_types: string[];
  hire_date: string;
  salary?: number;
}

export interface InstructorUpdate {
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
  photo?: File;
  license_types?: string;
  salary?: number;
  is_active?: boolean;
}

export interface InstructorList {
  id: number;
  full_name: string;
  license_types: string;
  salary?: number;
  hire_date: string;
  is_active: boolean;
  photo?: string;
  driving_school_name: string;
  email: string;
  phone: string;
  cin: string;
  assigned_vehicle?: number | null; // Véhicule assigné au moniteur
}

export interface InstructorStats {
  total_students: number;
  active_students: number;
  total_hours_this_month: number;
  total_sessions_this_month: number;
  earnings_this_month: number;
  upcoming_sessions: number;
  success_rate: number;
  average_rating: number;
}

export interface InstructorSchedule {
  date: string;
  sessions: InstructorSession[];
}

export interface InstructorSession {
  id: number;
  start_time: string;
  end_time: string;
  session_type: string;
  student_name?: string;
  vehicle?: string;
  status: string;
}

export const LICENSE_TYPES = [
  { value: 'A', label: 'Permis A (Moto)' },
  { value: 'B', label: 'Permis B (Voiture)' },
  { value: 'C', label: 'Permis C (Camion)' },
  { value: 'D', label: 'Permis D (Bus)' },
];

export const SESSION_TYPES = [
  { value: 'theory', label: 'Cours théorique' },
  { value: 'practical', label: 'Cours pratique' },
  { value: 'exam_prep', label: 'Préparation examen' },
];

export const SESSION_STATUS = [
  { value: 'scheduled', label: 'Programmée' },
  { value: 'completed', label: 'Terminée' },
  { value: 'cancelled', label: 'Annulée' },
  { value: 'no_show', label: 'Absence' },
];
