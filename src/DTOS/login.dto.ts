import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;
  @IsNotEmpty()
  password: string;
  @IsOptional()
  role: string
}
