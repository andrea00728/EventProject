import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn,Unique } from 'typeorm';
import { Localisation } from './Location';
import { Salle } from './salle';
import { TableEvent } from './Table';
import { Invite } from './Invite';
import { User } from 'src/Authentication/entities/auth.entity';


@Unique(['nom','user'])
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

  @Column({nullable:true})
  date_fin: Date;
  
  @ManyToOne(() => Localisation, (localisation) => localisation.salles)
  location: Localisation;

  @ManyToOne(() => Salle, (salle) => salle.location)
  salle: Salle;

  @OneToMany(() => TableEvent, (table) => table.event)
  tables: TableEvent[];

  @OneToMany(() => Invite, (invite) => invite.event)
  invites: Invite[];

  // @Column({ type: 'varchar', length: 255 })
    //   utilisateur_id: string;
    @ManyToOne(()=>User,(user)=>user.id,{nullable:false})
    @JoinColumn({name:'utilisateur_id'})
    user:User

    @Column({nullable:true})
    createdAt: Date;
}

