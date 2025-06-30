
import { Evenement } from 'src/entities/Evenement';
import { Entity, Column, PrimaryColumn, ManyToMany } from 'typeorm';

@Entity()
export class User {
  @PrimaryColumn({type:'varchar'})
  id: string;

  @Column()
  email: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true }) // Ajout de la colonne pour l'URL de l'image
  photo: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  
  @ManyToMany(()=>Evenement,evenement=>evenement.user)
  evenement:Evenement[];
}