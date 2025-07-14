import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreatePaymentPlanDto {
  @IsNumber()
  downPayment: number;

  @IsNumber()
  installment: number;

  @IsNumber()
  delivery: number;

  @IsString()
  schedule: string;

  @IsString()
  projectId: string;
} 