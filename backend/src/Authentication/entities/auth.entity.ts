import { Evenement } from 'src/entities/Evenement';
import { Favorite } from 'src/entities/Favorite';
import { Forfait } from 'src/entities/Forfait';
import { Goal } from 'src/entities/Goal';
import { Entity, Column, PrimaryColumn, ManyToMany, ManyToOne, JoinColumn, OneToMany } from 'typeorm';

export type UserRole = 'organisateur' | 'accueil' | 'caissier' | 'cuisinier'| 'admin';

@Entity('users')
export class User {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  password: string;

  @Column({ type: 'varchar', nullable: true })
  photo: string | null;

  @Column({
    type: 'enum',
    enum: ['organisateur', 'accueil', 'caissier', 'cuisinier','admin'],
    default: 'organisateur',
  })
  role: UserRole;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  /**
   * natoko anio alony
   */
  // @ManyToMany(()=>Evenement,evenement=>evenement.user)
  // evenement:Evenement[];
  @OneToMany(()=>Evenement,evenement=>evenement.user)
  evenement:Evenement[];

  @ManyToOne(()=>Forfait,{nullable:true})
  @JoinColumn({name:'forfait_id'})
  forfait:Forfait;

  @Column({type:'timestamp',nullable:true})
  datedowngraded:Date|null;

  @Column({type:'timestamp',nullable:true})
  forfaitexpirationdate:Date|null;

  // gestion de status 
  @Column({ type: 'boolean', default: false })
  isOnline: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastLogin: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastLogout: Date;


  @OneToMany(() => Favorite, (favorite) => favorite.user, { onDelete: 'CASCADE' })
  favorites: Favorite[];

  // dans User (auth.entity.ts)
  @OneToMany(() => Goal, (goal) => goal.user)
  goals: Goal[];


}

