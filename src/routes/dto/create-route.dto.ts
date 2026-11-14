import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MinLength } from 'class-validator';

export class CreateRouteDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    origin: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    destination: string;

    @IsNumber()
    @IsPositive()
    basePrice: number;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}