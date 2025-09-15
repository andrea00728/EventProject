import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne } from 'typeorm';

import { User } from 'src/Authentication/entities/auth.entity';
import { Salle } from './salle';

@Entity()
export class Localisation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column({ type: 'float', nullable: true })
  latitude: number | null;

  @Column({ type: 'float', nullable: true })
  longitude: number | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE'})
  createur: User | null;

  @OneToMany(() => Salle, (salle) => salle.location)
  salles: Salle[];
}