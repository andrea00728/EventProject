import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';
import { Salle } from './salle';
import { User } from 'src/Authentication/entities/auth.entity';
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
  
  @ManyToOne(() => User, (user) => user.localisations, { nullable: true })
  createur: User;
}