// src/calls/dto/create-call.dto.ts
import { IsUUID, IsString, IsDateString, IsInt, IsOptional } from 'class-validator';

export class CreateCallDto {
  @IsUUID()
  leadId: string;

  @IsDateString()
  date: string;

  @IsString()
  outcome: string;

  @IsInt()
  duration: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
