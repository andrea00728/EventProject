import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
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

  @Column({ enum: ['PENDING', 'IN_PROGRESS', 'READY'] })
  status: 'PENDING' | 'IN_PROGRESS' | 'READY';

  @Column({ enum: ['payé', 'non payé'] })
  paymentStatus: 'payé' | 'non payé';

  @Column('decimal')
  total: number;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  items: OrderItem[];
}