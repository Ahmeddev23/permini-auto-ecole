export interface Schedule {
  id: number;
  driving_school: number;
  driving_school_name: string;
  student: number;
  student_name: string;
  instructor?: number;
  instructor_name?: string;
  vehicle?: number;
  vehicle_info?: string;
  session_type: 'theory' | 'practical' | 'exam_theory' | 'exam_practical_circuit' | 'exam_practical_park';
  date: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  cancellation_reason?: string;
  duration_hours: number;
  created_at: string;
  updated_at: string;
}

export interface ScheduleList {
  id: number;
  student: number;
  student_name: string;
  instructor?: number;
  instructor_name?: string;
  vehicle?: number;
  vehicle_info?: string;
  session_type: 'theory' | 'practical' | 'exam_theory' | 'exam_practical_circuit' | 'exam_practical_park';
  date: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
}

export interface ScheduleCreate {
  student: number;
  instructor?: number;
  vehicle?: number;
  session_type: 'theory' | 'practical' | 'exam_theory' | 'exam_practical_circuit' | 'exam_practical_park';
  date: string;
  start_time: string;
  end_time: string;
  notes?: string;
}

export interface CalendarEvent {
  id: number;
  title: string;
  start: string;
  end: string;
  color: string;
  extendedProps: {
    session_type: string;
    student_name?: string;
    instructor_name?: string;
    vehicle?: string;
    status: string;
    notes?: string;
  };
}

export interface AvailabilityCheck {
  student_id?: number;
  instructor_id?: number;
  vehicle_id?: number;
  date: string;
  start_time: string;
  end_time: string;
}

export const SESSION_TYPES = {
  theory: 'Code',
  practical: 'Conduite',
  exam_theory: 'Examen Code',
  exam_practical_circuit: 'Examen Circuit',
  exam_practical_park: 'Examen Parking'
} as const;

export const SESSION_STATUS = {
  scheduled: 'Programmé',
  completed: 'Terminé',
  cancelled: 'Annulé',
  no_show: 'Absent'
} as const;

export const SESSION_COLORS = {
  theory: '#3498db',
  practical: '#2ecc71',
  exam_theory: '#e74c3c',
  exam_practical_circuit: '#f39c12',
  exam_practical_park: '#9b59b6'
} as const;
