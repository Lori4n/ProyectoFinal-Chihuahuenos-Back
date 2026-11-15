import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Trip } from '../../trips/entities/trip.entity';
import { User } from '../../auth/entities/user.entity';

export enum TicketStatus {
    AVAILABLE = 'AVAILABLE',
    SOLD = 'SOLD',
}

@Entity('tickets')
export class Ticket {
    @PrimaryGeneratedColumn('uuid')
    ticketId: string;

    @Column('int')
    seatNumber: number;

    @Column('text')
    routeName: string;

    @Column({
        type: 'enum',
        enum: TicketStatus,
        default: TicketStatus.AVAILABLE,
    })
    status: TicketStatus;

    @Column('text', { nullable: true })
    passengerName: string | null;

    @Column('float')
    price: number;

    @ManyToOne(() => Trip, (trip) => trip.tickets, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tripId' })
    trip: Trip;

    @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'userId' })
    user: User | null;
}