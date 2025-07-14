// src/entities/ShortLink.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ShortLink {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  slug: string; // Identifiant court unique (ex: "xyz123")

  @Column()
  eventId: number;

  @Column()
  tableId: number;

  @Column()
  originalUrl: string; // URL longue, ex: "http://localhost:3000/menus/event/123/table/456"
}