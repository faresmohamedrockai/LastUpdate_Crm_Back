export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';

export type TaskType = 'follow_up' | 'meeting_preparation' | 'contract_review' | 'payment_reminder' | 'visit_scheduling' | 'lead_nurturing' | 'general';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  dueDate: string; // Changed to string for API response
  priority: TaskPriority;
  status: TaskStatus;
  type: TaskType;
  reminder: boolean;
  reminderTime: string | null; // Changed to string for API response
  emailSent: boolean;
  
  // Relations
  assignedToId: string | null;
  createdById: string | null;
  leadId: string | null;
  projectId: string | null;
  inventoryId: string | null;
  
  createdAt: string; // Changed to string for API response
  updatedAt: string; // Changed to string for API response
  
  // Populated relations
  assignedTo: any | null;
  createdBy: any | null;
  lead: any | null;
  project: any | null;
  inventory: any | null;
} 