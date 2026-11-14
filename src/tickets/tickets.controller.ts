import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { PurchaseTicketsDto } from './dto/purchase-tickets.dto';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) { }

  @Get('trip/:tripId')
  findByTrip(@Param('tripId', ParseUUIDPipe) tripId: string) {
    return this.ticketsService.findByTrip(tripId);
  }

  @Post('purchase')
  purchaseTickets(@Body() purchaseTicketsDto: PurchaseTicketsDto) {
    return this.ticketsService.purchaseTickets(purchaseTicketsDto);
  }
}