// src/invitation/entities/invitation.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Evenement } from './Evenement';


@Entity()
export class Invitation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  templateType: string; 

  @Column()
  design: string; 
  @ManyToOne(() => Evenement, (event) => event.invites)
  event: Evenement;

  @Column()
  status: string; 
}