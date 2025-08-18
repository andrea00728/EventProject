import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('notification')
export class NotificationEntity{

    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    title:string;

    @Column()
    message:string;

        
    @Column({ default: 'info' })
    type: 'info' | 'success' | 'error' | 'warning';

    @CreateDateColumn()
    date:Date;
}