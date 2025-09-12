import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('forfait')
export class Forfait{

    @PrimaryGeneratedColumn()
    id:number;

    @Column({default:'freemium'})
    nom:string;

    @Column({nullable:true,type:'varchar'})
    maxevents:string|null;

    @Column({nullable:true,type:'varchar'})
    maxinvites:string|null;

    @Column({nullable:true,type:'varchar'})
    validationduration:string|null;

    // @Column({type:'timestamp',nullable:true})
    // expirationdate:Date;

    @Column({nullable:true})
    paypalplanid:string;

    @Column({type:'float',default:0})
    price:number;

    @Column({ nullable:true })
    fonctionnalite:string;

    @Column({ nullable:true })
    ideal:string;




}