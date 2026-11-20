import { ConflictException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { Route } from './entities/route.entity';

@Injectable()
export class RoutesService implements OnModuleInit {
  constructor(
    @InjectRepository(Route)
    private readonly routeRepository: Repository<Route>,
  ) { }

  async onModuleInit() {
    const count = await this.routeRepository.count();
    if (count === 0) {
      const initialRoutes = [
        { origin: 'Oaxaca', destination: 'Puebla', basePrice: 650 },
        { origin: 'Chihuahua', destination: 'Nuevo León', basePrice: 1150 },
        { origin: 'Baja California Norte', destination: 'Baja California Sur', basePrice: 1400 },
        { origin: 'Chihuahua', destination: 'CDMX', basePrice: 1850 },
      ];
      await this.routeRepository.save(initialRoutes);
    }
  }

  async create(createRouteDto: CreateRouteDto) {
    const origin = createRouteDto.origin.trim();
    const destination = createRouteDto.destination.trim();

    const existingRoute = await this.routeRepository
      .createQueryBuilder('route')
      .where('LOWER(route.origin) = LOWER(:origin)', { origin })
      .andWhere('LOWER(route.destination) = LOWER(:destination)', { destination })
      .getOne();

    if (existingRoute) {
      throw new ConflictException(
        `La ruta ${origin} - ${destination} ya existe en el catálogo`,
      );
    }

    const route = this.routeRepository.create({
      ...createRouteDto,
      origin,
      destination,
    });
    return await this.routeRepository.save(route);
  }

  async findAll() {
    return await this.routeRepository.find({
      where: { isActive: true },
    });
  }

  async findOne(id: string) {
    const route = await this.routeRepository.findOneBy({ routeId: id });
    if (!route) {
      throw new NotFoundException(`Ruta con ID ${id} no encontrada`);
    }
    return route;
  }

  async update(id: string, updateRouteDto: UpdateRouteDto) {
    const route = await this.routeRepository.preload({
      routeId: id,
      ...updateRouteDto,
    });
    if (!route) {
      throw new NotFoundException(`Ruta con ID ${id} no encontrada`);
    }
    return await this.routeRepository.save(route);
  }

  async remove(id: string) {
    const route = await this.findOne(id);
    await this.routeRepository.remove(route);
    return { message: `Ruta con ID ${id} eliminada correctamente` };
  }
}