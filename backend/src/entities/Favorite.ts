import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, CreateDateColumn } from 'typeorm';
import { User } from 'src/Authentication/entities/auth.entity';
import { Evenement } from './Evenement';

@Entity()
export class Favorite {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.favorites, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Evenement, (evenement) => evenement.favorites, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'evenement_id' })
  evenement: Evenement;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'varchar', nullable: true })
  note?: string;
}