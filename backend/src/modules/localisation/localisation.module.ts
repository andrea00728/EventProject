import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationService } from 'src/services/localisation-service/localisation-service.service';
import { LocationController } from 'src/controllers/localisation/localisation.controller';
import { Salle } from 'src/entities/salle'; // Assuming this exists based on SalleRepository
import { Evenement } from 'src/entities/Evenement';
import { Localisation } from 'src/entities/Location'; // Assuming this exists based on LocalisationRepository

@Module({
  imports: [
    TypeOrmModule.forFeature([Salle, Evenement, Localisation]), // Include Evenement and Localisation
  ],
  providers: [LocationService],
  controllers: [LocationController],
})
export class LocationModule {}