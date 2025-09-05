import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationService } from 'src/services/localisation-service/localisation-service.service';
import { LocationController } from 'src/controllers/localisation/localisation.controller';
import { Salle } from 'src/entities/salle'; // Assuming this exists based on SalleRepository
import { Evenement } from 'src/entities/Evenement';
import { Localisation } from 'src/entities/Location'; // Assuming this exists based on LocalisationRepository
import { HttpModule } from '@nestjs/axios';
import { User } from 'src/Authentication/entities/auth.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Salle, Evenement, Localisation, User]),
    HttpModule
  ],
  providers: [LocationService],
  controllers: [LocationController],
})

@Module({
  imports: [TypeOrmModule.forFeature([Localisation, Salle])],
  providers: [LocationService],
  exports: [LocationService],
})

export class LocationModule {}