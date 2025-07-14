import { IsString, IsOptional, IsDateString, IsUUID } from 'class-validator';

export class CreateMeetingDto {
  @IsDateString()
  date: string;

  @IsString()
  status: string; // e.g. "scheduled", "completed", "cancelled", "rescheduled"

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  objections?: string;

  @IsOptional()
  @IsString()
  location?: string; // e.g. "office", "site", or custom address

  @IsUUID()
  leadId: string;

  @IsOptional()
  @IsUUID()
  inventoryId?: string;

  @IsOptional()
  @IsUUID()
  projectId?: string;
} 