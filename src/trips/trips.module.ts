import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TripsService } from './trips.service';
import { TripsController } from './trips.controller';
import { Trip } from './entities/trip.entity';
import { RoutesModule } from '../routes/routes.module';

@Module({
  imports: [TypeOrmModule.forFeature([Trip]), RoutesModule],
  controllers: [TripsController],
  providers: [TripsService],
  exports: [TypeOrmModule],
})
export class TripsModule { }