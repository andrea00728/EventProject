// src/location/location.controller.ts
import { Controller, Post, Body, Get, Param, BadRequestException } from '@nestjs/common';
import { LocationService } from 'src/services/localisation-service/localisation-service.service';


@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  // Créer un lieu
  @Post()
  async createLocation(@Body('nom') nom: string) {
    if (!nom) {
      throw new BadRequestException('Le nom du lieu est requis');
    }
    return this.locationService.createLocation(nom);
  }

  // Récupérer tous les lieux
  @Get()
  findAllLocations() {
    return this.locationService.findAllLocations();
  }

  // Récupérer un lieu par ID
  @Get(':id')
  findLocationById(@Param('id') id: string) {
    return this.locationService.findLocationById(+id);
  }

  // Créer une salle
  @Post(':locationId/salles')
  async createSalle(@Param('locationId') locationId: string, @Body('nom') nom: string) {
    if (!nom) {
      throw new BadRequestException('Le nom de la salle est requis');
    }
    return this.locationService.createSalle(nom, +locationId);
  }

  // Récupérer les salles d'un lieu
  @Get(':locationId/salles')
  findSallesByLocation(@Param('locationId') locationId: string) {
    return this.locationService.findSallesByLocation(+locationId);
  }

  // Récupérer une salle par ID
  @Get('salles/:id')
  findSalleById(@Param('id') id: string) {
    return this.locationService.findSalleById(+id);
  }
}