import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Evenement } from './Evenement';

@Entity()
export class Element {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column()
  type: string;

  @Column('jsonb', { nullable: true })
  position: { left: number; top: number };

  @Column({ default: 0 })
  rotation: number;

  @Column({ nullable: true })
  width: number;

  @Column({ nullable: true })
  height: number;

  @Column({ nullable: true })
  color: string; // Ajout du champ color

  @Column({ type: 'varchar', nullable: true }) // Ajout du champ shape
  shape: 'rond' | 'carre' | 'rectangle' | 'triangle' | null;

  @ManyToOne(() => Evenement, (event) => event.elements)
  event: Evenement;
}