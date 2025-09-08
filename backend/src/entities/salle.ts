import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Localisation } from './Location';

@Entity()
export class Salle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @ManyToOne(() => Localisation, (localisation) => localisation.salles, {onDelete: 'CASCADE'})
  location: Localisation;
  
}
