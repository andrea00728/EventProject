import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Salle } from './salle';

@Entity()
export class Localisation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string; // Ex: Ivato, Anosy

  @Column({ type: 'float', nullable: true })
  latitude: number; // Coordonnée de latitude

  @Column({ type: 'float', nullable: true })
  longitude: number; // Coordonnée de longitude

  @OneToMany(() => Salle, (salle) => salle.location)
  salles: Salle[];
}