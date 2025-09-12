import { Entity, Column, PrimaryColumn, ManyToMany, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Evenement } from 'src/entities/Evenement';
import { Favorite } from 'src/entities/Favorite';
import { Forfait } from 'src/entities/Forfait';
import { Localisation } from 'src/entities/Location';
import { Goal } from 'src/entities/Goal';

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

  @Column({ default: 'organisateur' })
  role: string;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ type: 'varchar', nullable: true })
  verificationCode: string | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => Evenement, (evenement) => evenement.user)
  evenement: Evenement[];

  @ManyToOne(() => Forfait, { nullable: true })
  @JoinColumn({ name: 'forfait_id' })
  forfait: Forfait;

  @Column({ type: 'timestamp', nullable: true })
  datedowngraded: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  forfaitexpirationdate: Date | null;

  @Column({ type: 'boolean', default: false })
  isOnline: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastLogin: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastLogout: Date;

  @OneToMany(() => Favorite, (favorite) => favorite.user, { onDelete: 'CASCADE' })
  favorites: Favorite[];

  @OneToMany(() => Localisation, (localisation) => localisation.createur, { onDelete: 'CASCADE' })
  localisations: Localisation[];

  @OneToMany(() => Goal, (goal) => goal.user, { onDelete: 'CASCADE' })
  goals: Goal[];
}