import { IsOptional, IsString, IsNumber, IsArray, IsUUID } from 'class-validator';

export class UpdateInventoryDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  titleEn?: string;

  @IsOptional()
  @IsString()
  titleAr?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumber()
  area?: number;

  @IsOptional()
  @IsNumber()
  bedrooms?: number;

  @IsOptional()
  @IsNumber()
  bathrooms?: number;

  @IsOptional()
  @IsString()
  parking?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @IsOptional()
  @IsString()
  typeOther?: string;

  @IsOptional()
  @IsString()
  amenitiesOther?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  zoneId?: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  developerId?: string;

  @IsOptional()
  @IsNumber()
  paymentPlanIndex?: number;  // Index-based reference to payment plan within project

  @IsOptional()
  @IsNumber()
  downPayment?: number;

  @IsOptional()
  @IsNumber()
  deliveryPayment?: number;
}
