// order.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { TableEvent } from './Table';
import { OrderItem } from './order-item.entity';
import { User } from 'src/Authentication/entities/auth.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => TableEvent, (table) => table.orders)
  table: TableEvent;

  @ManyToOne(() => User, (user) => user.orders, { nullable: true })
  user: User;

  @Column()
  orderDate: Date;

  @Column({ default: 'pending' })
  status: 'pending' | 'preparing' | 'served' | 'paid';

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  items: OrderItem[];
}