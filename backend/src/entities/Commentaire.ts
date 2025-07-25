import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

export enum SatisfactionLevel{
  TRES_SATISFAIT="tres_satisfait",
  SATISFAIT="satisfait",
  PAS_SATISFAIT="pas_satisfait",
}
@Entity()
export class Commentaire {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  contenu: string;

  @Column()
  userEmail: string;

  @Column({ nullable: true })
  userName: string;

  @Column({ nullable: true })
  userPhoto: string;

  @Column({ 
    type: 'enum',
    enum: SatisfactionLevel,
    default: SatisfactionLevel.SATISFAIT,
  })
  satisfaction: SatisfactionLevel;

  @CreateDateColumn()
  createdAt: Date;
}