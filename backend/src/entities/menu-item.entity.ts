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

  @Column('decimal')
  price: number;

  @Column()
  category: string;

  @Column({ default: 0 })
  stock: number;

  @Column({ nullable: true })
  photo: string;

  @ManyToOne(() => Menu, (menu) => menu.items)
  menu: Menu;
}