import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, TableUnique, Unique } from 'typeorm';
import { TableEvent } from './Table';
import { Evenement } from './Evenement';

@Entity()
@Unique(['table','place'])
@Unique(['email','event'])
export class Invite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column()
  prenom: string;

  @Column()
  email: string;

  @Column({ enum: ['M', 'F'] })
  sex: string;

  @ManyToOne(() => Evenement, (event) => event.invites)
  event: Evenement;

  @ManyToOne(() => TableEvent, (table) => table.guests, { nullable: true })
  table: TableEvent;

  @Column({ nullable: true })
  place: number;

  @Column({ nullable: true })
  qrCode: string;
}