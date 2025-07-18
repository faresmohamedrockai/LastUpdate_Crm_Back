import { IsString, IsNumber, IsOptional, IsUUID, IsDateString } from 'class-validator';

export class CreateContractDto {
  @IsOptional()
  @IsString()
  leadId?: string;

  @IsOptional()
  @IsString()
  inventoryId?: string;

  @IsOptional()
  @IsNumber()
  dealValue?: number;

  @IsOptional()
  @IsString()
  contractDate?: string;

  @IsOptional()
  @IsString()
  status?: 'Pending' | 'Signed' | 'Cancelled';

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  createdById?: string;
}
