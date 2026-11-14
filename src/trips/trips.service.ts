import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { Trip } from './entities/trip.entity';
import { Route } from '../routes/entities/route.entity';
import { Ticket, TicketStatus } from '../tickets/entities/ticket.entity';

@Injectable()
export class TripsService {
  constructor(
    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,
    @InjectRepository(Route)
    private readonly routeRepository: Repository<Route>,
  ) { }

  async create(createTripDto: CreateTripDto) {
    // 1. Verificar que el autobús no esté ya asignado a esa misma fecha/hora
    const existingTrip = await this.tripRepository.findOneBy({
      busNumber: createTripDto.busNumber,
      departureTime: createTripDto.departureTime,
    });

    if (existingTrip) {
      throw new ConflictException(
        `El autobús ${createTripDto.busNumber} ya tiene un viaje programado para ${createTripDto.departureTime}`,
      );
    }

    // 2. Verificar que la ruta exista
    const route = await this.routeRepository.findOneBy({ routeId: createTripDto.routeId });
    if (!route) {
      throw new NotFoundException(`Ruta con ID ${createTripDto.routeId} no encontrada`);
    }

    const totalSeats = createTripDto.totalSeats ?? 40;
    const routeLabel = `${route.origin} - ${route.destination}`;

    const tickets: Partial<Ticket>[] = Array.from({ length: totalSeats }, (_, index) => ({
      seatNumber: index + 1,
      routeName: routeLabel,
      status: TicketStatus.AVAILABLE,
      price: route.basePrice,
      passengerName: null,
    }));

    const trip = this.tripRepository.create({
      departureTime: createTripDto.departureTime,
      totalSeats,
      busNumber: createTripDto.busNumber,
      route,
      tickets: tickets as Ticket[],
    });

    return await this.tripRepository.save(trip);
  }

  async findAll() {
    return await this.tripRepository.find({
      relations: { route: true },
    });
  }

  async findOne(id: string) {
    const trip = await this.tripRepository.findOne({
      where: { tripId: id },
      relations: { route: true, tickets: true },
      order: {
        tickets: { seatNumber: 'ASC' },
      },
    });
    if (!trip) {
      throw new NotFoundException(`Viaje con ID ${id} no encontrado`);
    }
    return trip;
  }

  async update(id: string, updateTripDto: UpdateTripDto) {
    const { routeId, ...rest } = updateTripDto;
    const trip = await this.tripRepository.preload({
      tripId: id,
      ...rest,
    });

    if (!trip) {
      throw new NotFoundException(`Viaje con ID ${id} no encontrado`);
    }

    if (routeId) {
      const route = await this.routeRepository.findOneBy({ routeId });
      if (!route) {
        throw new NotFoundException(`Ruta con ID ${routeId} no encontrada`);
      }
      trip.route = route;
    }

    return await this.tripRepository.save(trip);
  }

  async remove(id: string) {
    const trip = await this.findOne(id);
    await this.tripRepository.remove(trip);
    return { message: `Viaje ${id} eliminado correctamente` };
  }
}