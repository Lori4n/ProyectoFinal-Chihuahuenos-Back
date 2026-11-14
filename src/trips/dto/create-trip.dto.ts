import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';

export class CreateTripDto {
    @IsString()
    @IsNotEmpty()
    departureTime: string;

    @IsInt()
    @IsPositive()
    @IsOptional()
    totalSeats?: number;

    @IsString()
    @IsNotEmpty()
    busNumber: string;

    @IsUUID()
    @IsNotEmpty()
    routeId: string;
}