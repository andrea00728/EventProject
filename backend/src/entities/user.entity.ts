/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';


@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  googleId: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ default: 'organisateur' })
  role: 'admin' | 'organisateur';

  @Column({ type: 'text', nullable: true })
  photoUrl: string | null;

  @Column({ type: 'text', nullable: true })
  accessToken: string | null;

}