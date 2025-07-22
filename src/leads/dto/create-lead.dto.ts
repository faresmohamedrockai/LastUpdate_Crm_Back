import { IsString, IsOptional, IsUUID, IsEnum, IsNumber } from 'class-validator';

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
export class CreateLeadDto {
  @IsOptional()
  @IsString()
  name?: string;

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
  email?: string;


  @IsOptional()
  @IsString()
  assignedToId?: string;

  @IsOptional()
  @IsNumber()
  budget?: number;




  @IsOptional()
  @IsString()
  notes?: String[];




  @IsOptional()
  @IsString()
  source?: string;




  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @IsOptional()
  lastCall?: Date;

  @IsOptional()
  lastVisit?: Date;

  @IsOptional()
  @IsString()
  inventoryInterestId?: string;
}
