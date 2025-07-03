import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from 'src/Authentication/entities/auth.entity';
import { Evenement } from './Evenement';
import { Role } from './role.entity';

@Entity()
export class UserEventRole {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @ManyToOne(() => Evenement, (evenement) => evenement.id)
  evenement: Evenement;

  @ManyToOne(() => Role, (role) => role.id)
  role: Role;
}