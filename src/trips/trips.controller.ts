import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) { }

  @Post()
  @UseGuards(AdminGuard)
  create(@Body() createTripDto: CreateTripDto) {
    return this.tripsService.create(createTripDto);
  }

  @Get()
  findAll() {
    return this.tripsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tripsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateTripDto: UpdateTripDto) {
    return this.tripsService.update(id, updateTripDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tripsService.remove(id);
  }
}