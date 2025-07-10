import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, Unique } from 'typeorm';
import { Invite } from './Invite';
import { Evenement } from './Evenement';
import { Place } from './Place';
import { Order } from './order.entity';

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

  @OneToMany(() => Order, (order) => order.table)
  orders: Order[];


  @Column({ type: 'enum', enum: ['ronde', 'carree', 'rectangle', 'ovale'], default: 'ronde' })
  type: 'ronde' | 'carree' | 'rectangle' | 'ovale';

  @Column({ type: 'jsonb', nullable: true })
  position: { left: number; top: number };

  @ManyToOne(() => Evenement, (evenement) => evenement.tables,{onDelete: 'CASCADE'})
  @JoinColumn({name:'eventId'})
  event: Evenement;

  @OneToMany(() => Invite, (invite) => invite.table)
  guests: Invite[];
  @OneToMany(() => Place, (place) => place.table)
  places: Place[];

}