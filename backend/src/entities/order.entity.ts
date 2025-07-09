import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { TableEvent } from './Table';
import { OrderItem } from './order-item.entity';
import { Invite } from './Invite';
import { Payment } from './payment.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => TableEvent, (table) => table.orders)
  table: TableEvent;

  // @ManyToOne(() => Invite, (invite) => invite.orders, { nullable: true })
  // invite: Invite;

  @Column({ type: 'float', default: 0 })
  total: number;

  @Column()
  orderDate: Date;

  @Column({ default: 'pending' })
  status: 'pending' | 'preparing' | 'served';

  @Column({ default: 'unpaid' })
  paymentStatus: 'unpaid' | 'paid';

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  items: OrderItem[];

  @OneToMany(() => Payment, (payment) => payment.order)
  payments: Payment[];
}