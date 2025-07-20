// update-user.dto.ts
import { IsOptional, IsString, IsEmail, IsEnum } from 'class-validator';
import { Role } from '../auth/roles.enum';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEmail()
  teamLeaderId?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;


  @IsOptional()
  imageBase64?: string;
  @IsOptional()
  image?: string;


}
