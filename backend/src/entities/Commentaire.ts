import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Commentaire {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  contenu: string;

  @Column()
  userEmail: string;

  @CreateDateColumn()
  createdAt: Date;
}