import { IsString, IsNumber, IsOptional, IsArray, IsUUID, IsEnum } from 'class-validator';

export enum InventoryStatus {
  AVAILABLE = 'available',
  RESERVED = 'reserved',
  SOLD = 'sold',
  UNDER_CONSTRUCTION = 'under_construction',
}

export class CreateInventoryDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  price: number;

  @IsNumber()
  area: number;

  @IsNumber()
  bedrooms: number;

  @IsNumber()
  bathrooms: number;

  @IsOptional()
  @IsString()
  unitNumber?: string;

  @IsOptional()
  @IsNumber()
  floor?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsEnum(InventoryStatus)
  status?: InventoryStatus;

  @IsOptional()
  @IsUUID()
  projectId?: string;

  @IsOptional()
  @IsUUID()
  paymentPlanId?: string;
}
