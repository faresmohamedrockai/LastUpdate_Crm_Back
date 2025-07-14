import { IsString, IsNumber, IsOptional } from 'class-validator';

export class UpdatePaymentPlanDto {
  @IsOptional()
  @IsNumber()
  downPayment?: number;

  @IsOptional()
  @IsNumber()
  installment?: number;

  @IsOptional()
  @IsNumber()
  delivery?: number;

  @IsOptional()
  @IsString()
  schedule?: string;
} 