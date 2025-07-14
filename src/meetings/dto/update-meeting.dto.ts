import { IsString, IsOptional, IsDateString, IsUUID } from 'class-validator';

export class UpdateMeetingDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  objections?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsUUID()
  inventoryId?: string;

  @IsOptional()
  @IsUUID()
  projectId?: string;
} 