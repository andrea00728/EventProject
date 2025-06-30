import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  import { Commande } from './commande.entity';
  
  @Entity()
  export class MenuItem {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    eventId: number;
  
    @Column()
    nom: string;
  
    @Column({ nullable: true })
    description?: string;
  
    @Column('decimal', { precision: 10, scale: 2 })
    prix: number;
  
    @Column()
    stock: number;
  
    @Column({ nullable: true })
    photoUrl?: string;
  
    @Column({ nullable: true })
    allergenes?: string;
  
    @Column()
    categorieId: number;
  
    @Column()
    quantite: number;
  
    @ManyToOne(() => Commande, (commande) => commande.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'commandeId' })
    commande: Commande;
  }
  