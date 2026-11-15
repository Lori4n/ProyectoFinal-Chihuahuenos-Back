import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Ticket, TicketStatus } from './entities/ticket.entity';
import { PurchaseTicketDto } from './dto/purchase-tickets.dto';
import { User } from '../auth/entities/user.entity';

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

  async purchase(purchaseTicketDto: PurchaseTicketDto, user: User) {
    if (!user.isVerified) {
      throw new ForbiddenException(
        'Debes verificar tu identidad antes de poder comprar boletos',
      );
    }

    const uniqueSeats = [...new Set(purchaseTicketDto.seatNumbers)];

    const tickets = await this.ticketRepository.find({
      where: {
        trip: { tripId: purchaseTicketDto.tripId },
        seatNumber: In(uniqueSeats),
      },
      relations: { trip: true },
    });

    if (tickets.length !== uniqueSeats.length) {
      throw new NotFoundException(
        'Uno o más de los asientos seleccionados no existen en este viaje',
      );
    }

    const soldTickets = tickets.filter((t) => t.status === TicketStatus.SOLD);
    if (soldTickets.length > 0) {
      const occupiedNumbers = soldTickets.map((t) => t.seatNumber).join(', ');
      throw new ConflictException(
        `Los siguientes asientos ya fueron vendidos: ${occupiedNumbers}`,
      );
    }

    const passengerName = purchaseTicketDto.passengerName?.trim() || user.fullName;
    if (!passengerName) {
      throw new BadRequestException('El nombre el comprador es obligatorio');
    }

    for (const ticket of tickets) {
      ticket.status = TicketStatus.SOLD;
      ticket.passengerName = passengerName;
      ticket.user = user;
    }

    return await this.ticketRepository.save(tickets);
  }
}