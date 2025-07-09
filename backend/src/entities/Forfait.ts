import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('forfait')
export class Forfait {
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    nom:String;

    @Column({nullable:true})
    maxEvents:number;

    @Column()
    maxInvites:number;

    @Column()
    validationDuration:number;

    @Column({type:'timestamp',default:()=>'CURRENT_TIMESTAMP'})
    createdAt:Date
}