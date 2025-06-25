// src/visit/dto/create-visit.dto.ts
import { IsDateString, IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateVisitDto {
  @IsDateString()
  date: string;

  @IsString()
  status: string;

  @IsUUID()
  leadId: string;

  @IsUUID()
  inventoryId: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
