import { IsString, IsNumber, IsOptional, IsUUID, IsDateString } from 'class-validator';
import {IsFutureDateIfPendingOrSigned} from './contract'
export class CreateContractDto {
  @IsOptional()
  @IsString()
  leadId?: string;

  @IsOptional()
  @IsString()
  inventoryId?: string;

  @IsOptional()
  @IsString()
  cNumber?: string;

  @IsOptional()
  @IsNumber()
  dealValue?: number;

   @IsFutureDateIfPendingOrSigned('status')
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
