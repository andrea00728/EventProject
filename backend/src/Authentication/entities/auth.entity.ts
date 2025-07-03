import { Entity, Column, PrimaryColumn, ManyToMany } from 'typeorm';
import { Evenement } from 'src/entities/Evenement';

@Entity()
export class User {
  @PrimaryColumn({ type: 'varchar' })
  id: string;

  @Column()
  email: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  photo: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToMany(() => Evenement, (evenement) => evenement.user)
  evenement: Evenement[];
}