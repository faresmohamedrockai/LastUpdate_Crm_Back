import { IsOptional, IsString, IsNumber, IsUUID } from 'class-validator';
import { LeadStatus } from '@prisma/client';

export class UpdateLeadDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  contact?: string;

  @IsOptional()
  @IsNumber()
  budget?: number;

  @IsOptional()
  @IsString()
  leadSource?: string;

  @IsOptional()
  status?: LeadStatus;

  @IsOptional()
  @IsString()
  notes?: string; 

  @IsOptional()
  @IsUUID()
  inventoryInterestId?: string;

  @IsOptional()
  lastCall?: Date;

  @IsOptional()
  lastVisit?: Date;
}
