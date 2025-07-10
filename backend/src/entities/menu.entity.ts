import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { Evenement } from './Evenement';
import { MenuItem } from './menu-item.entity';

@Entity()
export class Menu {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Evenement, (event) => event.menus)
  event: Evenement;

  @OneToMany(() => MenuItem, (menuItem) => menuItem.menu)
  items: MenuItem[];
  evenement: any;
} 