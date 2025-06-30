// src/entities/Table.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Invite } from './Invite';
import { Evenement } from './Evenement';

@Entity()
export class TableEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  numero: number;

  @Column()
  capacite: number;

  @Column({ default: 0 })
  placeReserve: number;

  @ManyToOne(() => Evenement, (evenement) => evenement.tables)
  event: Evenement;

  @OneToMany(() => Invite, (invite) => invite.table)
  guests: Invite[];
}