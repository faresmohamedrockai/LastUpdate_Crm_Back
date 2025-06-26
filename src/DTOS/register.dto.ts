import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  ValidateIf,
  IsUUID,
} from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @MinLength(6, { message: 'Minimum Length of Password 6 characters' })
  password: string;

  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsNotEmpty({ message: 'Role is required' })
  role: string;

  // ✅ مطلوب فقط لو role = sales_rep
  @ValidateIf((obj) => obj.role === 'sales_rep')
  @IsUUID('4', { message: 'Team leader ID must be a valid UUID' })
  teamLeaderId?: string;
}
