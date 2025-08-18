// src/invitation/entities/invitation.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Evenement } from './Evenement';


@Entity()
export class Invitation {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => Evenement, (event) => event.invites,{onDelete: 'CASCADE'})
  event: Evenement;
  @Column({ default: 'ENVOYÉ' })
  status: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}