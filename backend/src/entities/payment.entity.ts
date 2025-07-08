// entities/payment.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Order } from './order.entity';
import { User } from 'src/Authentication/entities/auth.entity';
import { Evenement } from './Evenement';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  orderId: number;

  @ManyToOne(() => User)
  user: User; // Caissier qui a validé le paiement

  @Column()
  userId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @ManyToOne(() => Evenement)
  event: Evenement;

  @Column()
  eventId: number;

  @Column()
  paymentDate: Date;


  @ManyToOne(() => Order, (order) => order.payments)
  order: Order;


  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}