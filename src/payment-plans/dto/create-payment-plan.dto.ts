
import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, IsDateString, ValidateIf, registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import {IsLastInstallmentAfterFirst} from './IsLastInstallmentAfterFirst';

export enum InstallmentPeriodEnum {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  CUSTOM = 'custom',
}

// Custom validator to ensure date string is valid and parseable
function IsValidDateString(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidDateString',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (!value) return true; // Allow optional
          if (typeof value !== 'string') return false;
          
          // Check if it's a valid ISO date string
          const date = new Date(value);
          return !isNaN(date.getTime()) && value === date.toISOString().split('T')[0];
        },
        defaultMessage() {
          return `${propertyName} must be a valid date string in YYYY-MM-DD format`;
        }
      }
    });
  };
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

  @IsValidDateString({
    message: 'First installment date must be a valid date string in YYYY-MM-DD format'
  })
  firstInstallmentDate: string;

  @IsValidDateString({
    message: 'Delivery date must be a valid date string in YYYY-MM-DD format'
  })
  @IsLastInstallmentAfterFirst('firstInstallmentDate', {
    message: 'Delivery date cannot be before the first installment date',
  })
  deliveryDate: string;

  @IsOptional()
  @IsString()
  description?: string;
}
