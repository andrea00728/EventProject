import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Menu } from './menu.entity';

@Entity()
export class MenuItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ type: 'decimal' })
  price: number;

  @Column()
  category: string;

  @Column()
  stock: number;

  @Column({ default: false })
  disabled: boolean;

  @Column({ type: 'decimal', default: 5 })
  stockThreshold: number;

  @ManyToOne(() => Menu, (menu) => menu.items)
  menu: Menu;
}