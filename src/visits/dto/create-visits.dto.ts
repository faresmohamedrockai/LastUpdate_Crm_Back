// src/visit/dto/create-visit.dto.ts

import {
  IsDateString,
  IsString,
  IsUUID,
  IsOptional,
} from 'class-validator';
import { IsFutureDateIfScheduled } from '../../meetings/dto/checkScheduale';



export class CreateVisitDto {
  @IsOptional()
  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  inventoryId: string;

  @IsOptional()
  @IsUUID('4', { message: 'Project ID must be a valid UUID' })
  projectId?: string; // Note: This field is not currently used due to database schema limitations

  @IsOptional()
  @IsString()
  objections?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
