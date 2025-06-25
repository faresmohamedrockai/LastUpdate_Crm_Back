import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';

export class UpdateInventoryDto {
  @IsOptional()
  @IsString()
  title?: string;

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
  @IsBoolean()
  parking?: boolean;

  @IsOptional()
  @IsString()
  amenities?: string;

  @IsOptional()
  @IsString()
  geo?: string;
}
