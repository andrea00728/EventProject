import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/Authentication/entities/auth.entity';
import { EvenementController } from 'src/controllers/evenement/evenement.controller';
import { Evenement } from 'src/entities/Evenement';
import { Localisation } from 'src/entities/Location';
import { Salle } from 'src/entities/salle';
import { TableEvent } from 'src/entities/Table';
import { EvenementService } from 'src/services/evenement/evenement.service';
import { ForfaitModule } from '../forfait/forfait.module';
import { NotificationModule } from '../notification/notification.module';

// IMPORT du LocationModule pour utiliser LocationService
import { LocationModule } from '../localisation/localisation.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Evenement, Localisation, Salle, TableEvent, User]),
    ForfaitModule,
    NotificationModule,
    LocationModule,  // <-- Import ici au lieu de déclarer LocationService dans providers
  ],
  controllers: [EvenementController],
  providers: [EvenementService], // LocationService SUPPRIMÉ d'ici
  exports: [EvenementService],
})
export class EvenementModule {}
