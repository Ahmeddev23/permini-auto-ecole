export interface Vehicle {
  id: number;
  driving_school: number;
  driving_school_name: string;
  assigned_instructor?: number;
  assigned_instructor_name?: string;
  license_plate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  vehicle_type: 'A' | 'B' | 'C' | 'D';
  engine_number?: string;
  chassis_number?: string;
  current_mileage: number;
  technical_inspection_date: string;
  insurance_expiry_date: string;
  status: 'active' | 'maintenance' | 'inactive';
  photo?: string;
  is_available_now: boolean;
  days_until_technical_control: number;
  days_until_insurance_expiry: number;
  created_at: string;
  updated_at: string;
}

export interface VehicleCreate {
  brand: string;
  model: string;
  year: number;
  license_plate: string;
  vehicle_type: 'A' | 'B' | 'C' | 'D';
  color: string;
  engine_number?: string;
  chassis_number?: string;
  current_mileage: number;
  technical_inspection_date: string;
  insurance_expiry_date: string;
  status: 'active' | 'maintenance' | 'inactive';
}

export interface VehicleUpdate {
  brand?: string;
  model?: string;
  year?: number;
  color?: string;
  engine_number?: string;
  chassis_number?: string;
  current_mileage?: number;
  technical_inspection_date?: string;
  insurance_expiry_date?: string;
  status?: 'active' | 'maintenance' | 'inactive';
}

export interface VehicleFormData {
  brand: string;
  model: string;
  year: number;
  license_plate: string;
  vehicle_type: 'A' | 'B' | 'C' | 'D';
  color: string;
  status: 'active' | 'maintenance' | 'inactive';
  assigned_instructor: number | null;
  notes: string;
}

export interface VehicleList {
  id: number;
  brand: string;
  model: string;
  year: number;
  license_plate: string;
  vehicle_type: 'A' | 'B' | 'C' | 'D';
  color: string;
  status: 'active' | 'maintenance' | 'inactive';
  photo?: string;
  assigned_instructor?: number;
  assigned_instructor_name?: string;
  technical_inspection_date: string;
  insurance_expiry_date: string;
}

export interface VehicleStats {
  total_hours_used: number;
  total_sessions: number;
  monthly_usage: number;
  maintenance_cost_this_year: number;
  next_technical_control: string;
  next_insurance_renewal: string;
  average_daily_usage: number;
}

export const VEHICLE_TYPES = {
  'A': 'Moto',
  'B': 'Voiture', 
  'C': 'Camion',
  'D': 'Bus'
} as const;

export const VEHICLE_STATUS = {
  'active': 'Actif',
  'maintenance': 'En maintenance',
  'inactive': 'Inactif'
} as const;
