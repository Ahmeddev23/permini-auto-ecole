export type UserRole = 'admin' | 'driving_school' | 'instructor' | 'student';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  cin?: string;
  user_type: UserRole;
  photo?: string;
  is_verified: boolean;
  date_joined: string;
  driving_school?: {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  instructor_profile?: {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    driving_school: number;
    driving_school_name: string;
    photo?: string;
  };
  student_profile?: {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    driving_school: number;
    driving_school_name: string;
    photo?: string;
  };
}

export interface DrivingSchool {
  id: number;
  name: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  current_plan: 'free' | 'standard' | 'premium';
}

export interface Student {
  id: string;
  userId: string;
  drivingSchoolId: string;
  licenseCategory: 'A' | 'B' | 'C' | 'D';
  theoreticalHours: number;
  practicalHours: number;
  status: 'active' | 'paused' | 'graduated' | 'dropped';
  enrollmentDate: string;
}

export interface Instructor {
  id: string;
  userId: string;
  drivingSchoolId: string;
  licenseNumber: string;
  experience: number;
  specialties: string[];
  isActive: boolean;
}

export interface Lesson {
  id: string;
  studentId: string;
  instructorId: string;
  type: 'theoretical' | 'practical';
  date: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

export interface Payment {
  id: string;
  studentId: string;
  amount: number;
  type: 'enrollment' | 'lesson' | 'exam';
  status: 'pending' | 'completed' | 'failed';
  date: string;
  method: 'cash' | 'card' | 'transfer';
}

export interface AuthContextType {
  user: User | null;
  login: (loginField: string, password: string) => Promise<{ user: User; token: string; driving_school?: DrivingSchool }>;
  loginDrivingSchool: (email: string, password: string) => Promise<{ user: User; token: string; driving_school?: DrivingSchool }>;
  loginInstructor: (email: string, password: string) => Promise<{ user: User; token: string }>;
  loginStudent: (email: string, password: string) => Promise<{ user: User; token: string }>;
  logout: () => void;
  isLoading: boolean;
}

export interface Language {
  code: 'fr' | 'ar';
  name: string;
  flag: string;
  flagComponent?: React.ReactNode;
}