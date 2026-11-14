import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoutesService } from './routes.service';
import { RoutesController } from './routes.controller';
import { Route } from './entities/route.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Route]), AuthModule],
  controllers: [RoutesController],
  providers: [RoutesService],
  exports: [TypeOrmModule],
})
export class RoutesModule { }