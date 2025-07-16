import { IsString, IsOptional, IsArray, IsUUID,ValidateNested } from 'class-validator';
import {  Type } from 'class-transformer';

import { NestedPaymentPlanDto } from '../../payment-plans/dto/create-payment-plan.dto';
export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  nameEn?: string;

  @IsOptional()
  @IsString()
  nameAr?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];  // ✅ مصفوفة من الصور، وليس string

  @IsOptional()
  @IsUUID()
  developerId?: string;

  @IsOptional()
  @IsUUID()
  zoneId?: string;


@IsOptional()
@IsArray()
@ValidateNested({ each: true })
@Type(() => NestedPaymentPlanDto)
paymentPlans?: NestedPaymentPlanDto[];

}
