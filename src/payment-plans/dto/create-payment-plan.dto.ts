import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePaymentPlanDto {
  @IsNumber()
  downPayment: number; // ✅ بدل downpayment

  @IsNumber()
  installment: number;

  @IsNumber()
  delivery: number;

  @IsOptional()
  schedule: any;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  yearsToPay?: number;

  @IsNumber()
  installmentPeriod: number;

  @IsNumber()
  installmentEvery: number;

  @IsString()
  projectId: string;
}
