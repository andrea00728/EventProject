import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationController } from 'src/controllers/localisation/localisation.controller';
import { Localisation } from 'src/entities/Location';
import { Salle } from 'src/entities/salle';
import { LocationService } from 'src/services/localisation-service/localisation-service.service';

@Module({
  imports: [TypeOrmModule.forFeature([Localisation, Salle])],
  controllers: [LocationController],
  providers: [LocationService],
  exports: [LocationService],
})
export class LocationModule {}