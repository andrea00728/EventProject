import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique, OneToMany } from 'typeorm';
import { TableEvent } from './Table';
import { Evenement } from './Evenement';
import { Order } from './order.entity';

@Entity()
@Unique(['table', 'place'])
@Unique(['email', 'event'])
export class Invite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column()
  prenom: string;

  @Column()
  email: string;

  @Column({ enum: ['M', 'F'] })
  sex: string;

  @ManyToOne(() => Evenement, (event) => event.invites, { onDelete: 'CASCADE' })
  event: Evenement;

  @ManyToOne(() => TableEvent, (table) => table.guests, { nullable: true })
  table: TableEvent;

  @Column({ nullable: true })
  place: number;

  @Column({ nullable: true })
  qrCode: string;

  @OneToMany(() => Order, (order) => order.invite)
  orders: Order[];
}