import { IsString, IsOptional,IsNumber } from 'class-validator';

export class CreateDeveloperDto {
  @IsString()
  nameEn: string;
  @IsOptional()
  @IsString()
  nameAr?: string;

  @IsOptional()
  @IsString()
  established?: string;

  @IsOptional()
  @IsString()
  location?: string; 

  @IsOptional()
  @IsString()
  email?: string; 

  @IsOptional()
  @IsNumber()
  phone?: number; 


  @IsOptional()
  @IsString()
  image?: string;
}
