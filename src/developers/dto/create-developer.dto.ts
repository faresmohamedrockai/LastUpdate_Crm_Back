import { IsString, IsOptional } from 'class-validator';

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
  @IsString()
  image?: string;
}
