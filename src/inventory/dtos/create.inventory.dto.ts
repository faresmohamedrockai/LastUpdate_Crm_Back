import { IsString, IsNumber, IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class CreateInventoryDto {
  @IsString()
  title: string;

  @IsString()
  type: string;

  @IsNumber()
  price: number;

  @IsString()
  location: string;

@IsOptional()
@IsUUID()
projectId?: string;

  @IsNumber()
  area: number;

  @IsNumber()
  bedrooms: number;

  @IsNumber()
  bathrooms: number;

  @IsBoolean()
  parking: boolean;

  @IsString()
  amenities: string;

  @IsString()
  geo: string;

  @IsOptional()
@IsString({ each: true })
base64Images?: string[];

}
