import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Commande } from './commande.entity';

@Entity()
export class MenuItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column('decimal', { precision: 10, scale: 2 })
  prix: number;

  @Column({ default: 0 })
  stock: number;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  photoUrl: string;

  @Column({ nullable: true })
  allergenes: string;

  @Column()
  eventId: number;

  @Column()
  categorieId: number;

  @Column({ default: 0 })
  quantite: number;

  @ManyToOne(() => Commande, (commande) => commande.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'commandeId' })
  commande: Commande;
}
