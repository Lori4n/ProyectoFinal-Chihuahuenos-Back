import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Trip } from '../../trips/entities/trip.entity';

@Entity('routes')
@Unique(['origin', 'destination'])
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