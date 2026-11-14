import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TripsService } from './trips.service';
import { TripsController } from './trips.controller';
import { Trip } from './entities/trip.entity';
import { Route } from '../routes/entities/route.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Trip, Route]), AuthModule],
  controllers: [TripsController],
  providers: [TripsService],
  exports: [TypeOrmModule],
})
export class TripsModule { }