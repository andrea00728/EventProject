import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

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

  @CreateDateColumn()
  createdAt: Date;
}