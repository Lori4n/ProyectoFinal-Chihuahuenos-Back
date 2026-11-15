import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { TicketsService } from './tickets.service';
import { PurchaseTicketDto } from './dto/purchase-tickets.dto';
import { VerifiedUserGuard } from '../auth/guards/verified-user.guard';
import { User } from '../auth/entities/user.entity';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) { }

  @Get('trip/:tripId')
  findByTrip(@Param('tripId', ParseUUIDPipe) tripId: string) {
    return this.ticketsService.findByTrip(tripId);
  }

  @Post('purchase')
  @UseGuards(VerifiedUserGuard)
  purchase(@Body() purchaseTicketDto: PurchaseTicketDto, @Req() req: Request) {
    const user = (req as any).user as User;
    return this.ticketsService.purchase(purchaseTicketDto, user);
  }
}