import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, Unique } from 'typeorm';
import { Localisation } from './Location';
import { Salle } from './salle';
import { TableEvent } from './Table';
import { Invite } from './Invite';
import { User } from 'src/Authentication/entities/auth.entity';
import { Personnel } from './Personnel';
import { Invitation } from './Invitation';
import { Menu } from './menu.entity';
import { Balance } from './balance.entity';
import { Payment } from './payment.entity';
import { Favorite } from './Favorite';


@Unique(['nom', 'user'])
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

  @Column({ nullable: true })
  date_fin: Date;


  @ManyToOne(() => Localisation, (localisation) => localisation.salles)
  location: Localisation;

  @Column({ nullable: true })
  locationId: number;

  @ManyToOne(() => Salle, { onDelete: 'CASCADE' })
  salle: Salle;

  @Column({ nullable: true })
  salleId: number;

  @OneToMany(() => TableEvent, (table) => table.event, { onDelete: 'CASCADE' })
  tables: TableEvent[];

  @OneToMany(() => Invite, (invite) => invite.event, { onDelete: 'CASCADE' })
  invites: Invite[];

  @OneToMany(() => Personnel, (personnel) => personnel.evenement, { onDelete: 'CASCADE' })
  personnels: Personnel[];

  @OneToMany(() => Invitation, (inv) => inv.event)
  invitation: Invitation[];

  @OneToMany(() => Menu, (menu) => menu.evenement)
  menus: Menu[];

  @OneToMany(() => Balance, (balance) => balance.event)
  balances: Balance[];

  @OneToMany(() => Payment, (payment) => payment.event)
  payments: Payment[];

  /**
   * natoko anio ko lony
   */
  // @ManyToOne(()=>User,(user)=>user.id,{nullable:false})
  // @JoinColumn({name:'utilisateur_id'})
  // user:User

  @ManyToOne(() => User, (user) => user.evenement, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'utilisateur_id' })
  user: User;


  @Column({ type: 'float', nullable: true })
  montanttransaction?: number;

  @Column({ nullable: true })
  createdAt: Date;

  @Column({ type: 'boolean', default: false })
  isPublic: boolean;

  @OneToMany(() => Favorite, (favorite) => favorite.evenement, { onDelete: 'CASCADE' })
  favorites: Favorite[];
  maxGuest: number;
}
