import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Evenement } from './Evenement';

@Entity('elements')
export class Element {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column()
  type: string;

  @Column({ type: 'json', nullable: true })
  position: { left: number; top: number };

  @Column({ default: 0 })
  rotation: number;

  @Column({ nullable: true })
  width: number;

  @Column({ nullable: true })
  height: number;

  @ManyToOne(() => Evenement, (event) => event.elements, { onDelete: 'CASCADE' })
  event: Evenement;
}