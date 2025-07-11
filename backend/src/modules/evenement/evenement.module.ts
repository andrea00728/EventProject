import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/Authentication/entities/auth.entity';
import { EvenementController } from 'src/controllers/evenement/evenement.controller';
import { Evenement } from 'src/entities/Evenement';
import {  Localisation } from 'src/entities/Location';
import { Salle } from 'src/entities/salle';
import {  TableEvent } from 'src/entities/Table';
import { EvenementService } from 'src/services/evenement/evenement.service';
import { LocationService } from 'src/services/localisation-service/localisation-service.service';
import { ForfaitModule } from '../forfait/forfait.module';

@Module({
    imports:[
        TypeOrmModule.forFeature([Evenement,Localisation,Salle,TableEvent,User]),
        ForfaitModule,
    ],
    controllers:[EvenementController],
    providers:[EvenementService,LocationService],
    exports:[EvenementService]
})
export class EvenementModule {}
