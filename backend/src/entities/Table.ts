import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, Unique } from 'typeorm';
import { Invite } from './Invite';
import { Evenement } from './Evenement';

@Unique(['numero','event'])
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
  @JoinColumn({name:'eventId'})
  event: Evenement;

  @OneToMany(() => Invite, (invite) => invite.table)
  guests: Invite[];

}