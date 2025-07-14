import { IsString, IsNumber, IsOptional, IsUUID, IsDateString } from 'class-validator';

export class CreateContractDto {
  @IsUUID()
  leadId: string;

  @IsOptional()
  @IsUUID()
  inventoryId?: string;

  @IsOptional()
  @IsUUID()
  projectId?: string;

  @IsNumber()
  dealValue: number;

  @IsDateString()
  contractDate: string;

  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  notes?: string;
} 