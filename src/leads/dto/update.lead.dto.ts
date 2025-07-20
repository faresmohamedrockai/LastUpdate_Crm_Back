// leads/dto/update-lead.dto.ts
import { IsOptional, IsString, IsUUID } from 'class-validator';

export enum LeadStatus {
  FRESH_LEAD = 'fresh_lead',
  FOLLOW_UP = 'follow_up',
  SCHEDULED_VISIT = 'scheduled_visit',
  OPEN_DEAL = 'open_deal',
  CANCELLATION = 'cancellation',
  CLOSED_DEAL = 'closed_deal',
  NO_ANSWER = 'no_answer',
  NOT_INTERSTED_NOW = 'not_intersted_now',
}
export class UpdateLeadDto {
 
  @IsOptional()
  @IsString()
  nameAr?: string;

  @IsOptional()
  @IsString()
  nameEn?: string;

  @IsOptional()
  @IsString()
  contact?: string;

  @IsOptional()
  @IsString()
  budget?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  assignedToId?: string;

  @IsOptional()
  status?: LeadStatus;

  @IsOptional()
  lastCall?: Date;
 
@IsOptional()

  notes?: string[];


  @IsOptional()
  lastVisit?: Date;

  @IsOptional()
  @IsUUID()
  inventoryInterestId?: string;
}
