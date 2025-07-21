
import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, IsDateString } from 'class-validator';
import {IsLastInstallmentAfterFirst} from './IsLastInstallmentAfterFirst';

export enum InstallmentPeriodEnum {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  CUSTOM = 'custom',
}

export class NestedPaymentPlanDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsNumber()
  downpayment: number;

  @IsNumber()
  installment: number;

  @IsNumber()
  delivery: number;

  @IsString()
  schedule: string;

  @IsNumber()
  yearsToPay: number;

  @IsEnum(InstallmentPeriodEnum)
  installmentPeriod: InstallmentPeriodEnum;

  @IsNumber()
  installmentMonthsCount: number;

  @IsDateString()
  firstInstallmentDate: string;





  @IsDateString()
  @IsLastInstallmentAfterFirst('firstInstallmentDate', {
  message: 'Delivery date cannot be before the first installment date',
})
deliveryDate: string;

  @IsOptional()
  @IsString()
  description?: string;
}
