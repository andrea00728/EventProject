import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Commande } from './commande.entity';

@Entity()
export class MenuItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  eventId: number;

  @Column()
  nom: string;

  @Column({ nullable: true })
  description: string;

  @Column('decimal')
  prix: number;

  @Column()
  stock: number;

  @Column({ nullable: true })
  photoUrl: string;

  @Column('simple-array', { nullable: true })
  allergenes: string[];

  @Column()
  categorieId: number;

  @Column()
  quantite: number;

  @ManyToOne(() => Commande, commande => commande.items)
  commande: Commande;
}
