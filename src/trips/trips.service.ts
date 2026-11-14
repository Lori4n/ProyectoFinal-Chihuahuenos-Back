import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { Trip } from './entities/trip.entity';
import { Route } from '../routes/entities/route.entity';

@Injectable()
export class TripsService {
  constructor(
    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,
    @InjectRepository(Route)
    private readonly routeRepository: Repository<Route>,
  ) { }

  async create(createTripDto: CreateTripDto) {
    const route = await this.routeRepository.findOneBy({ routeId: createTripDto.routeId });
    if (!route) {
      throw new NotFoundException(`Ruta con ID ${createTripDto.routeId} no encontrada`);
    }

    const trip = this.tripRepository.create({
      departureTime: new Date(createTripDto.departureTime),
      totalSeats: createTripDto.totalSeats ?? 40,
      busNumber: createTripDto.busNumber,
      route,
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
      relations: { route: true },
    });
    if (!trip) {
      throw new NotFoundException(`Viaje con ID ${id} no encontrado`);
    }
    return trip;
  }

  async update(id: string, updateTripDto: UpdateTripDto) {
    const { routeId, departureTime, ...rest } = updateTripDto;
    const trip = await this.tripRepository.preload({
      tripId: id,
      ...rest,
      ...(departureTime ? { departureTime: new Date(departureTime) } : {}),
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