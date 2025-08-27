import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export type UserRole = 'admin';

@Entity('admin')
export class Admin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  photo: string; // modifiable pour le site

  @Column({ type: 'varchar', nullable: true })
  photoEmail: string; // image fixe utilisée dans les emails

  @Column({
    type: 'enum',
    enum: ['admin'],
    default: 'admin',
  })
  role: UserRole;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'boolean', default: false })
  isOnline: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastLogin: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastLogout: Date;
  bio: any;
}
