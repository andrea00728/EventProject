import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('contact_messages')
export class ContactMessage {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column() // email de l'utilisateur
    email: string;

    @Column({ nullable: true }) // email de l'expéditeur (support)
    senderEmail: string;

    @Column({ nullable: true })
    phone: string;

    @Column('text')
    message: string;

    @Column({ default: false })   // lecture du message
    isRead: boolean;

    @Column({ default: false })   // indique si c'est un email envoyé
    isSent: boolean;

    @CreateDateColumn()
    createdAt: Date;
}
