import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Salle } from './salle';

@Entity()
export class Localisation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string; // Ex: Ivato, Anosy

  @OneToMany(() => Salle, (salle) => salle.location)
  salles: Salle[];
}