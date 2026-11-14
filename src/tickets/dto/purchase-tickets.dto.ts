import { ArrayMinSize, IsArray, IsInt, IsNotEmpty, IsString, IsUUID, Min } from 'class-validator';

export class PurchaseTicketsDto {
    @IsUUID()
    @IsNotEmpty()
    tripId: string;

    @IsArray()
    @ArrayMinSize(1)
    @IsInt({ each: true })
    @Min(1, { each: true })
    seatNumbers: number[];

    @IsString()
    @IsNotEmpty()
    passengerName: string;
}