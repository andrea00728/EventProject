import { Entity, Column, PrimaryColumn, ManyToMany, ManyToOne, JoinColumn, OneToMany } from 'typeorm';

export type UserRole = 'admin';

@Entity('admin')
export class Admin {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  photo: string;

  @Column({
    type: 'enum',
    enum: ['admin'],
    default: 'admin',
  })
  role: UserRole;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  // gestion de status 
  @Column({ type: 'boolean', default: false })
  isOnline: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastLogin: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastLogout: Date;

}

