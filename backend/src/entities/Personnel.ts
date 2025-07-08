
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Evenement } from './Evenement';

@Entity()
export class Personnel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column()
  email: string;

  @Column({ type: 'enum', enum: ['accueil', 'caissier', 'cuisinier'] })
  role: 'accueil' | 'caissier' | 'cuisinier';

  @ManyToOne(() => Evenement, evenement => evenement.personnels, { onDelete: 'CASCADE' })
  evenement: Evenement;

  @Column({nullable:true})
    createdAt: Date;
}
