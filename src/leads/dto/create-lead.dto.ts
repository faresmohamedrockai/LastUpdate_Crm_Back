// leads/dto/create-lead.dto.ts
import { IsString, IsNumber, IsOptional, IsUUID, IsEnum } from 'class-validator';
// src/common/enums/lead-status.enum.ts
export enum LeadStatus {
  FRESH_LEAD = 'fresh_lead',
  FOLLOW_UP = 'follow_up',
  SCHEDULED_VISIT = 'scheduled_visit',
  OPEN_DEAL = 'open_deal',
  CANCELLATION = 'cancellation',
}

export class CreateLeadDto {
  @IsString()
  name: string;


  
  @IsString()
  nameAr: string;



  @IsString()
  nameEn: string;

  @IsString()
  contact: string;

  @IsString()
  budget: string;

  @IsString()
  leadSource: string;

  @IsString()
  status: LeadStatus; 

  @IsOptional()
  lastCall?: Date;

  @IsOptional()
  lastVisit?: Date;

  @IsOptional()
  @IsUUID()
  inventoryInterestId?: string;




}
