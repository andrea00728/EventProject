
import { Evenement } from 'src/entities/Evenement';
import { Forfait } from 'src/entities/Forfait';
import { Entity, Column, PrimaryColumn, ManyToMany, ManyToOne } from 'typeorm';


export type UserRole='organisateur'|'accueil'|'caissier'|'cuisinier';
@Entity('users')
export class User {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true }) 
  photo: string;
 @Column({
    type: 'enum',
    enum: ['organisateur', 'accueil', 'caissier', 'cuisinier'],
    default: 'organisateur',
  })
  role: UserRole;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  
  @ManyToMany(()=>Evenement,evenement=>evenement.user)
  evenement:Evenement[];

  @ManyToOne(()=>Forfait,{nullable:true})
  forfait:Forfait;

  @Column({type:'timestamp',nullable:true})
  forfaitExpiration:Date;
}


