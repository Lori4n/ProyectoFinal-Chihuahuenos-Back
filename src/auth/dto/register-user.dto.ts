import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterUserDto {
    @IsString()
    @IsNotEmpty()
    fullName: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
    password: string;
}