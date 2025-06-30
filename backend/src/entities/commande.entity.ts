import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    CreateDateColumn,
  } from 'typeorm';
  import { MenuItem } from './menu-item.entity';
  
  export enum CommandeStatus {
    EN_ATTENTE = 'en_attente',
    CONFIRMEE = 'confirmee',
    ANNULEE = 'annulee',
    PENDING = "PENDING",
  }
  
  @Entity()
  export class Commande {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    tableId: number;
  
    @Column()
    eventId: number;
  
    @Column({ type: 'enum', enum: CommandeStatus, default: CommandeStatus.EN_ATTENTE })
    statut: CommandeStatus;
  
    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    total: number;
  
    @OneToMany(() => MenuItem, (item) => item.commande, {
      cascade: true,
      eager: true, // Charge les items automatiquement (optionnel)
      onDelete: 'CASCADE',
    })
    items: MenuItem[];
  
    @CreateDateColumn()
    createdAt: Date;
  }
  