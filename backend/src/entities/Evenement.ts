import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, Unique } from 'typeorm';
import { Localisation } from './Location';
import { Salle } from './salle';
import { TableEvent } from './Table';
import { Invite } from './Invite';
import { User } from 'src/Authentication/entities/auth.entity';
import { Personnel } from './Personnel';
import { Invitation } from './Invitation';
import { Menu } from './menu.entity';
import { Balance } from './balance.entity';
import { Payment } from './payment.entity';
import { Favorite } from './Favorite';
import { Element } from './Element';

export enum EventStatus {
  PLANNED = 'planned',
  CANCELED = 'canceled',
  COMPLETED = 'completed',
}

@Unique(['nom', 'user']) // Unique constraint on event name per user
@Entity()
export class Evenement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column({ enum: ['mariage', 'reunion', 'anniversaire', 'engagement', 'autre'] })
  type: string;

  @Column()
  theme: string;

  @Column()
  date: Date;

  @Column({ nullable: true })
  date_fin: Date;

  @OneToMany(() => Menu, (menu) => menu.evenement, { onDelete: 'CASCADE' })
  menus: Menu[];

  @ManyToOne(() => Localisation, (localisation) => localisation.salles, { onDelete: 'SET NULL' })
  location: Localisation;

  @ManyToOne(() => Salle, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'salleId' })
  salle: Salle;

  @Column({ nullable: true })
  salleId: number;

  @OneToMany(() => TableEvent, (table) => table.event, { onDelete: 'CASCADE' })
  tables: TableEvent[];

  @OneToMany(() => Invite, (invite) => invite.event, { onDelete: 'CASCADE' })
  invites: Invite[];

  @OneToMany(() => Balance, (balance) => balance.event, { onDelete: 'CASCADE' })
  balances: Balance[];

  @OneToMany(() => Payment, (payment) => payment.event, { onDelete: 'CASCADE' })
  payments: Payment[];

  @ManyToOne(() => User, (user) => user.evenement, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'utilisateur_id' })
  user: User;

  @Column({ type: 'float', nullable: true })
  montanttransaction?: number;

  @OneToMany(() => Personnel, (personnel) => personnel.evenement, { onDelete: 'CASCADE' })
  personnels: Personnel[];

  @Column({ nullable: true })
  createdAt: Date;

  @Column({ type: 'boolean', default: false })
  isPublic: boolean;

  @OneToMany(() => Invitation, (inv) => inv.event, { onDelete: 'CASCADE' })
  invitation: Invitation[];

  @Column({ type: 'enum', enum: EventStatus, default: EventStatus.PLANNED })
  status: EventStatus;

  @OneToMany(() => Favorite, (favorite) => favorite.evenement, { onDelete: 'CASCADE' })
  favorites: Favorite[];

  @Column({ type: 'int', nullable: true }) // Added missing Column decorator
  maxGuest: number;

  @OneToMany(() => Element, (element) => element.event, { onDelete: 'CASCADE' })
  elements: Element[];

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}