import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { MenuItem } from './menu-item.entity';

export type CommandeStatus = 'en_attente' | 'paye' | 'annule';

@Entity()
export class Commande {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  eventId: number;

  @Column()
  tableId: number;

  @OneToMany(() => MenuItem, item => item.commande, { cascade: true, eager: true })
  items: MenuItem[];

  @Column('decimal')
  total: number;

  @Column({ type: 'enum', enum: ['en_attente', 'paye', 'annule'], default: 'en_attente' })
  statut: CommandeStatus;

  @CreateDateColumn()
  createdAt: Date;
}
