// src/entities/Place.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TableEvent } from './Table';


@Entity()
export class Place {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  number: number;

  @Column({ default: false })
  reserved: boolean;

  @ManyToOne(() => TableEvent, (table) => table.guests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tableId' })
  table: TableEvent;
}