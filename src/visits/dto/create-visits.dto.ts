// src/visit/dto/create-visit.dto.ts

import {
  IsDateString,
  IsString,
  IsUUID,
  IsOptional,
} from 'class-validator';

export class CreateVisitDto {
  @IsDateString()
  date: string;

  @IsString()
  status: string;

@IsOptional()
  @IsString()
  inventoryId: string;

  @IsOptional()
  @IsString()
  objections?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
