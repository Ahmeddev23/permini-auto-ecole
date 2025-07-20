export interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  status_display: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  priority_display: string;
  admin_response?: string;
  responded_at?: string;
  responded_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface SupportTicketsResponse {
  tickets: SupportTicket[];
  total: number;
}

export interface SupportRequestData {
  subject: string;
  message: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface SupportRequestResponse {
  success: boolean;
  message: string;
  ticket_id: string;
}
