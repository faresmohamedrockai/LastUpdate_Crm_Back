import { IsString, IsOptional, IsArray, IsUUID } from 'class-validator';

export class UpdateProjectDto {
  nameEn?: string;
  nameAr?: string;
  location?: string;
  description?: string;
  images?: string | null;
  developerId?: string;
  zoneId?: string;
}
