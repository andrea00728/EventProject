// src/entities/order.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { TableEvent } from './Table';
import { Evenement } from './Evenement';
import { Invite } from './Invite';
import { OrderItem } from './order-item.entity';
import { Payment } from './payment.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => TableEvent, (table) => table.orders, { onDelete: 'CASCADE' })
  table: TableEvent;

  @ManyToOne(() => Evenement, { onDelete: 'CASCADE' })
  event: Evenement;

  @ManyToOne(() => Invite, (invite) => invite.orders, { nullable: true })
  invite: Invite;

  @Column({ nullable: true })
  nom: string;

  @Column({ nullable: true })
  email: string;

  @Column()
  orderDate: Date;

  @Column()
  status: string;

  @Column()
  paymentStatus: string;

  @Column('float')
  total: number;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  items: OrderItem[];

  @OneToMany(() => Payment, (payment) => payment.order)
  payments: Payment[];
}