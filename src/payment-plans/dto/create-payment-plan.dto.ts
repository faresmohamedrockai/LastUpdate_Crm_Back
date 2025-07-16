import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export enum InstallmentPeriodEnum {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  CUSTOM = 'custom',
}

export class NestedPaymentPlanDto {
  @IsNumber()
  downPayment: number;

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

  @IsEnum(InstallmentPeriodEnum)
  installmentPeriod: InstallmentPeriodEnum;

  @IsNumber()
  installmentEvery: number;
}
