import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Route } from '../../routes/entities/route.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';

@Entity('trips')
@Unique(['busNumber', 'departureTime'])
export class Trip {
    @PrimaryGeneratedColumn('uuid')
    tripId: string;

    @Column('text')
    departureTime: string;

    @Column('int', { default: 40 })
    totalSeats: number;

    @Column('text')
    busNumber: string;

    @ManyToOne(() => Route, (route) => route.trips, { eager: true })
    @JoinColumn({ name: 'routeId' })
    route: Route;

    @OneToMany(() => Ticket, (ticket) => ticket.trip, { cascade: true })
    tickets: Ticket[];
}