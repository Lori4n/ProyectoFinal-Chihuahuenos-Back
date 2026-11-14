import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) { }

  @Post()
  @UseGuards(AdminGuard)
  create(@Body() createRouteDto: CreateRouteDto) {
    return this.routesService.create(createRouteDto);
  }

  @Get()
  findAll() {
    return this.routesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.routesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateRouteDto: UpdateRouteDto) {
    return this.routesService.update(id, updateRouteDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.routesService.remove(id);
  }
}