import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Localisation } from './Location';
import { Salle } from './salle';
import { TableEvent } from './Table';
import { Invite } from './Invite';
import { User } from 'src/Authentication/entities/auth.entity';


@Entity()
export class Evenement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column({ enum: ['mariage', 'reunion', 'anniversaire', 'engagement', 'autre'] })
  type: string;

  @Column()
  theme: string;

  @Column()
  date: Date;

  @ManyToOne(() => Localisation, (localisation) => localisation.salles)
  location: Localisation;

  @ManyToOne(() => Salle, (salle) => salle.location)
  salle: Salle;

  @OneToMany(() => TableEvent, (table) => table.event)
  tables: TableEvent[];

  @OneToMany(() => Invite, (invite) => invite.event)
  invites: Invite[];

  @ManyToOne(()=>User,user=>user.evenement,)
  user:User;
}