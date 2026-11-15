import {
    ArrayMinSize,
    IsArray,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsPositive,
    IsString,
    IsUUID,
} from 'class-validator';

export class PurchaseTicketDto {
    @IsUUID()
    @IsNotEmpty()
    tripId: string;

    @IsArray()
    @ArrayMinSize(1, { message: 'Debes seleccionar al menos un asiento' })
    @IsInt({ each: true })
    @IsPositive({ each: true })
    seatNumbers: number[];

    @IsString()
    @IsOptional()
    passengerName?: string;
}