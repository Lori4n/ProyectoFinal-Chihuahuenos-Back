import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Trip } from '../../trips/entities/trip.entity';

@Entity('routes')
export class Route {
    @PrimaryGeneratedColumn('uuid')
    routeId: string;

    @Column('text')
    origin: string;

    @Column('text')
    destination: string;

    @Column('float')
    basePrice: number;

    @Column('boolean', { default: true })
    isActive: boolean;

    @OneToMany(() => Trip, (trip) => trip.route)
    trips: Trip[];
}