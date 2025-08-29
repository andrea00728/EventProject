
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique } from 'typeorm';
import { Evenement } from './Evenement';

@Entity()
@Unique(['email','evenement'])
export class Personnel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column()
  email: string;

  @Column({ type: 'enum', enum: ['accueil', 'caissier', 'cuisinier'] })
  role: 'accueil' | 'caissier' | 'cuisinier';

  @ManyToOne(() => Evenement, evenement => evenement.personnels, { onDelete: 'CASCADE' })
  evenement: Evenement;


  /**
   * utilise pour la desactivation du personnel apres expiration de l'evenement
   */
  @Column({type:'boolean',default:true})
  isActive:boolean;


  @Column({ type: 'enum', enum: ['attent', 'accepter'], default: 'attent' })
  status: 'attent' | 'accepter';

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
