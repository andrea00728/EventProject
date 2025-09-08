import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { TableEvent } from './Table';
import { Evenement } from './Evenement';
import { Invite } from './Invite';
import { OrderItem } from './order-item.entity';
import { Payment } from './payment.entity';
import { User } from 'src/Authentication/entities/auth.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => TableEvent, (table) => table.orders, { onDelete: 'SET NULL' })
  table: TableEvent;

  @ManyToOne(() => Evenement, { onDelete: 'SET NULL' })
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

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { onDelete: 'CASCADE' })
  items: OrderItem[];

  @OneToMany(() => Payment, (payment) => payment.order, { onDelete: 'CASCADE' })
  payments: Payment[];

  @Column({ nullable: true })
  refundDate: Date;

  @Column({ nullable: true })
  refundReason: string;

  @ManyToOne(() => User, { nullable: true })
  refundedBy: User;
}