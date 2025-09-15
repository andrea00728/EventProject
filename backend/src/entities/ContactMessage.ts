import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('contact_messages')
export class ContactMessage {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    email: string;

    @Column({ nullable: true })
    phone: string;

    @Column('text')
    message: string;

    @Column({ default: false })   // <-- Nouveau champ pour marquer la lecture
    isRead: boolean;

    @CreateDateColumn()
    createdAt: Date;
}
