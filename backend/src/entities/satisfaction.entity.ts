import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Satisfaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'boolean', default: false })
  isSatisfied: boolean;

  @Column()
  userEmail: string;

  @Column({ nullable: true })
  userName: string;

  @Column({ nullable: true })
  userPhoto: string;

  @CreateDateColumn()
  createdAt: Date;
}