import { User } from 'src/Authentication/entities/auth.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('goals')
export class Goal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 3 })
  monthlyEvents: number;

  @Column({ default: 50 })
  attendeesTarget: number;

  @ManyToOne(() => User, user => user.goals, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
