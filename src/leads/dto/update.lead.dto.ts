// leads/dto/update-lead.dto.ts
import { IsOptional, IsString, IsEnum } from 'class-validator';

export enum LeadStatus {
  FRESH_LEAD = 'fresh_lead',
  FOLLOW_UP = 'follow_up',
  SCHEDULED_VISIT = 'scheduled_visit',
  OPEN_DEAL = 'open_deal',
  CANCELLATION = 'cancellation',
  CLOSED_DEAL = 'closed_deal',
  NO_ANSWER = 'no_answer',
  NOT_INTERSTED_NOW = 'not_intersted_now',
  RESERVATION = 'reservation',
}

export class UpdateLeadDto {
  @IsOptional()
  @IsString()
  nameEn?: string;

  @IsOptional()
  @IsString()
  nameAr?: string;

  @IsOptional()
  @IsString()
  contact?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  budget?: number | string; // Allow both number and string

  @IsOptional()
  @IsString()
  inventoryInterestId?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @IsOptional()
  @IsString()
  assignedToId?: string;

  // Additional fields that might be needed
  @IsOptional()
  lastCall?: Date;

  @IsOptional()
  notes?: string[];

  @IsOptional()
  lastVisit?: Date;
}
