import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Route } from '../../routes/entities/route.entity';

@Entity('trips')
export class Trip {
    @PrimaryGeneratedColumn('uuid')
    tripId: string;

    @Column('timestamp')
    departureTime: Date;

    @Column('int', { default: 40 })
    totalSeats: number;

    @Column('text')
    busNumber: string;

    @ManyToOne(() => Route, (route) => route.trips, { eager: true })
    @JoinColumn({ name: 'routeId' })
    route: Route;
}