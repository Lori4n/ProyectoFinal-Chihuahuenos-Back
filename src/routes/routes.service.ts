import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
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
    const route = this.routeRepository.create(createRouteDto);
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
    return { message: `Ruta ${id} eliminada correctamente` };
  }
}