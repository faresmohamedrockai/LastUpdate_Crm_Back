import { IsString, IsOptional, IsArray, IsUUID, ValidateNested } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { NestedPaymentPlanDto } from '../../payment-plans/dto/create-payment-plan.dto';

export class CreateProjectDto {
  @IsString()
  nameEn: string;

  @IsOptional()
  @IsString()
  nameAr?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  images?: string[] | null;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  inventories?: string[];


  @IsOptional()
  @IsString()
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
