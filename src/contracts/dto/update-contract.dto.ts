import { IsString, IsNumber, IsOptional, IsUUID, IsDateString } from 'class-validator';

export class UpdateContractDto {
  @IsOptional()
  @IsUUID()
  inventoryId?: string;

  @IsOptional()
  @IsUUID()
  projectId?: string;

  @IsOptional()
  @IsNumber()
  dealValue?: number;

  @IsOptional()
  @IsDateString()
  contractDate?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
} 