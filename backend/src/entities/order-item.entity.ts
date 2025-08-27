import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Order } from './order.entity';
import { MenuItem } from './menu-item.entity';

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  //'CASCADE' ici pour supprimer automatiquement les items si l'order est supprimée
  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  order: Order;

  @ManyToOne(() => MenuItem, { onDelete: 'CASCADE' })
  menuItem: MenuItem;

  @Column()
  quantity: number;

  @Column('decimal')
  subtotal: number;
}
