import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}