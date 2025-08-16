import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  ValidateIf,
  IsUUID,
  IsOptional,
  MaxLength,
  Matches,
  IsString,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RegisterDto {
  @IsEmail(
    { 
      allow_display_name: false,
      require_tld: true,
      allow_ip_domain: false 
    }, 
    { message: 'Invalid email format. Please use a valid email address like user@example.com' }
  )
  @MaxLength(255, { message: 'Email address cannot exceed 255 characters' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(100, { message: 'Password cannot exceed 100 characters' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    { message: 'Password must be 6+ chars with uppercase, lowercase, number & symbol' }
  )
  password: string;

  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name cannot exceed 100 characters' })
  @Matches(
    /^[a-zA-Z\u0600-\u06FF\s]+$/,
    { message: 'Name can only contain letters and spaces' }
  )
  name: string;

  @IsString({ message: 'Role must be a string' })
  @IsNotEmpty({ message: 'Role is required' })
  @IsIn(['admin', 'sales_admin', 'team_leader', 'sales_rep'], {
    message: 'Role must be one of: admin, sales_admin, team_leader, sales_rep'
  })
  role: string;

  @ValidateIf((obj) => obj.role === 'sales_rep')
  @IsUUID('4', { message: 'Team leader ID must be a valid UUID' })
  teamLeaderId?: string;

  @IsOptional()
  @IsString({ message: 'Image must be a valid base64 string' })
  imageBase64?: string;
}
