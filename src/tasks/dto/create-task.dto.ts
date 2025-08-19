import { IsString, IsOptional, IsDateString, IsEnum, IsBoolean } from 'class-validator';
import { TaskPriority, TaskStatus, TaskType } from '../types';
import { IsOptionalUUID } from './optional-uuid.decorator';

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  dueDate: string;

  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'urgent'])
  priority?: TaskPriority;

  @IsOptional()
  @IsEnum(['pending', 'in_progress', 'completed', 'cancelled', 'overdue'])
  status?: TaskStatus;

  
  @IsOptional()
  @IsEnum(['follow_up', 'meeting_preparation', 'contract_review', 'payment_reminder', 'visit_scheduling', 'lead_nurturing', 'general'])
  type: TaskType;

  @IsOptional()
  @IsBoolean()
  reminder?: boolean;

  @IsOptional()
  @IsDateString()
  reminderTime?: string;

  @IsOptionalUUID()
  assignedToId?: string;

  @IsOptionalUUID()
  leadId?: string;

  @IsOptionalUUID()
  projectId?: string;

  @IsOptionalUUID()
  inventoryId?: string;
} 