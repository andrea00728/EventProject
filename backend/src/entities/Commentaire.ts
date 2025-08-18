  import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

  export enum SatisfactionLevel{
    DECEVANT="decevant",
    MOYEN="moyen",
    BIEN="bien",
    TRES_BIEN="tres_bien",
    EXELLENT="excellent",
  }
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

    @Column({ 
      type: 'enum',
      enum: SatisfactionLevel,
      default: SatisfactionLevel.DECEVANT,
    })
    satisfaction: SatisfactionLevel;

    @CreateDateColumn()
    createdAt: Date;
  }