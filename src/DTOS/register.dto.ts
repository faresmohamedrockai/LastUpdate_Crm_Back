import { IsEmail, IsNotEmpty,  MinLength } from "class-validator";

export class RegisterDto {
  @IsEmail({}, { message: 'Invalid email format' })
    email: string;

 @MinLength(6,{message:"Minimum Length of Password 6 characters"})
 password: string;


   @IsNotEmpty({message:"Role is Required"})
    role:string
  }