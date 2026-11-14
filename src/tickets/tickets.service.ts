import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Ticket, TicketStatus } from './entities/ticket.entity';
import { PurchaseTicketsDto } from './dto/purchase-tickets.dto';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
  ) { }

  async findByTrip(tripId: string) {
    return await this.ticketRepository.find({
      where: { trip: { tripId } },
      order: { seatNumber: 'ASC' },
    });
  }

  async purchaseTickets(purchaseTicketsDto: PurchaseTicketsDto) {
    const { tripId, seatNumbers, passengerName } = purchaseTicketsDto;

    const tickets = await this.ticketRepository.find({
      where: {
        trip: { tripId },
        seatNumber: In(seatNumbers),
      },
    });

    if (tickets.length !== seatNumbers.length) {
      throw new NotFoundException('Uno o más asientos seleccionados no existen en este viaje');
    }

    // Valida que ninguno haya sido comprado ya por otro usuario
    for (const ticket of tickets) {
      if (ticket.status === TicketStatus.SOLD) {
        throw new ConflictException(
          `El asiento #${ticket.seatNumber} ya fue comprado por otro usuario :(`,
        );
      }
    }

    // Marca los asientos como vendidos
    for (const ticket of tickets) {
      ticket.status = TicketStatus.SOLD;
      ticket.passengerName = passengerName;
    }

    const purchased = await this.ticketRepository.save(tickets);

    return {
      message: 'Compra realizada con éxito!',
      tickets: purchased,
    };
  }
}