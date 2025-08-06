// update-user.dto.ts
import { 
  IsOptional, 
  IsString, 
  IsEmail, 
  IsEnum, 
  MinLength, 
  MaxLength, 
  Matches, 
  IsUUID 
} from 'class-validator';
import { Role } from '../auth/roles.enum';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name cannot exceed 100 characters' })
  @Matches(
    /^[a-zA-Z\u0600-\u06FF\s]+$/,
    { message: 'Name can only contain letters and spaces' }
  )
  name?: string;

  @IsOptional()
  @IsEmail(
    { 
      allow_display_name: false,
      require_tld: true,
      allow_ip_domain: false 
    }, 
    { message: 'Please provide a valid email address (e.g., user@example.com)' }
  )
  @MaxLength(255, { message: 'Email address cannot exceed 255 characters' })
  email?: string;

  @IsOptional()
  @IsUUID('4', { message: 'Team leader ID must be a valid UUID' })
  teamLeaderId?: string;

  @IsOptional()
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(100, { message: 'Password cannot exceed 100 characters' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    { message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' }
  )
  password?: string;

  @IsOptional()
  @IsEnum(Role, { 
    message: 'Role must be one of: admin, sales_admin, team_leader, sales_rep' 
  })
  role?: Role;

  @IsOptional()
  @IsString({ message: 'Image must be a valid base64 string' })
  imageBase64?: string;

  @IsOptional()
  @IsString({ message: 'Image URL must be a string' })
  image?: string;
}
