import { IsString, IsNumber, IsOptional, IsArray, IsUUID } from 'class-validator';

export class CreateInventoryDto {
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
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];


  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsString()
  typeOther?: string;

  @IsOptional()
  @IsString()
  amenitiesOther?: string;

  

  @IsOptional()
  @IsString()
  status?: string;


  
 @IsOptional()
  @IsString()
  zoneId!: string;  // required field

 @IsOptional()
  @IsString()
  projectId!: string; // required field

 @IsOptional()
  @IsString()
  developerId!: string; // required field


 @IsOptional()
  @IsString()
  parking?: string;

  @IsOptional()
  @IsNumber()
  paymentPlanIndex?: number;  // Index-based reference to payment plan within project
}
