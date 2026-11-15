import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum UserRole {
    CLIENT = 'CLIENT',
    ADMIN = 'ADMIN',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    userId: string;

    @Column('text')
    fullName: string;

    @Column('text', { unique: true })
    email: string;

    @Column('text', { select: false })
    password: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.CLIENT,
    })
    role: UserRole;

    @Column('boolean', { default: false })
    isVerified: boolean;

    @Column('text', { nullable: true })
    idDocumentUrl: string | null;
}