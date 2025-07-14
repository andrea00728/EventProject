import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { TableEvent } from './Table';
import { OrderItem } from './order-item.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => TableEvent, (table) => table.orders)
  table: TableEvent;

  @Column()
  orderDate: Date;

  @Column({ default: 'pending' })
  status: 'pending' | 'preparing' | 'served' | 'paid';

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  items: OrderItem[]; 
}