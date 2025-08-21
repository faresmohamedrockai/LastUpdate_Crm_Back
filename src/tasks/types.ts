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
export interface Meeting {
  id: string;
  title?: string;
  client?: string;
  date?: string;
  time?: string;
  duration?: string;
  type?: string;
  status?: 'Scheduled' | 'Completed' | 'Cancelled';
  notes?: string;
  objections?: string;
  location?: string;
  locationType?: string;
  inventory?: any;
  project?: any;
  lead?: any;
  assignedTo?: any;
  createdBy?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface Call {
  id: string;
  leadId: string;
  projectId?: string | null;
  date: string;           // تاريخ المكالمة
  time?: string | null;    // وقت المكالمة (لو موجود)
  outcome: 'Interested' | 'Not Interested' | 'Follow Up Required' | 'Meeting Scheduled' | string;
  followUpDate?: string | null; // تاريخ المتابعة
  followUpTime?: string | null; // وقت المتابعة
  duration?: string | null;
  notes?: string | null;
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
  createdByUser?: {
    id: string;
    email: string;
    name: string;
    role: Role;
    // ممكن تضيف أي حاجة أخرى بيرجعها Prisma
  } | null;
}

export enum Role {
  ADMIN = 'admin',
  SALES_ADMIN = 'sales_admin',
  SALES_REP = 'sales_rep',
  TEAM_LEADER = 'team_leader',
}

export interface User {
  id: string;
  email: string;
  name: string;
  password: string;

  refreshToken?: string | null;
  createdAt: Date;
  image?: string | null;
  teamLeaderId?: string | null;

  assignedMeetings: Meeting[];
  createdMeetings: Meeting[];
  assignedTasks: Task[];
  createdTasks: Task[];
  createdCalls: Call[];

  teamLeader?: User | null;
  teamMembers: User[];

}