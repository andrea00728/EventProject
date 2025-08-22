import { Controller, Post, Body, Get, Param, BadRequestException, Put, Delete } from '@nestjs/common';
import { LocationService } from 'src/services/localisation-service/localisation-service.service';
import { Query } from '@nestjs/common';

@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get()
  findLocations(@Query('search') search?: string) {
    if (search) {
      return this.locationService.findLocationsBySearch(search);
    }
    return this.locationService.findAllLocations();
  }

  @Get()
  findAllLocations() {
    return this.locationService.findAllLocations();
  }

  @Get(':id')
  async findLocationById(@Param('id') id: string) {
    const idNum = parseInt(id, 10);
    if (isNaN(idNum) || idNum <= 0) {
      throw new BadRequestException('L\'ID doit être un entier positif valide');
    }
    return this.locationService.findLocationById(idNum);
  }

  @Post(':locationId/salles')
  async createSalle(@Param('locationId') locationId: string, @Body('nom') nom: string) {
    if (!nom) {
      throw new BadRequestException('Le nom de la salle est requis');
    }
    const idNum = parseInt(locationId, 10);
    if (isNaN(idNum) || idNum <= 0) {
      throw new BadRequestException('L\'ID du lieu doit être un entier positif valide');
    }
    return this.locationService.createSalle(nom, idNum);
  }

  @Get(':locationId/salles')
  findSallesByLocation(@Param('locationId') locationId: string) {
    const idNum = parseInt(locationId, 10);
    if (isNaN(idNum) || idNum <= 0) {
      throw new BadRequestException('L\'ID du lieu doit être un entier positif valide');
    }
    return this.locationService.findSallesByLocation(idNum);
  }

  @Get('salles/:id')
  findSalleById(@Param('id') id: string) {
    const idNum = parseInt(id, 10);
    if (isNaN(idNum) || idNum <= 0) {
      throw new BadRequestException('L\'ID de la salle doit être un entier positif valide');
    }
    return this.locationService.findSalleById(idNum);
  }

  @Put(':id')
  async updateLocation(@Param('id') id: string, @Body('nom') nom: string) {
    const idNum = parseInt(id, 10);
    if (isNaN(idNum) || idNum <= 0) {
      throw new BadRequestException('L\'ID doit être un entier positif valide');
    }
    return this.locationService.updateLocation(idNum, nom);
  }

  @Delete(':id')
  async deleteLocation(@Param('id') id: string) {
    const idNum = parseInt(id, 10);
    if (isNaN(idNum) || idNum <= 0) {
      throw new BadRequestException('L\'ID doit être un entier positif valide');
    }
    return this.locationService.deleteLocation(idNum);
  }

  @Put('salles/:id')
  async updateSalle(@Param('id') id: string, @Body('nom') nom: string) {
    const idNum = parseInt(id, 10);
    if (isNaN(idNum) || idNum <= 0) {
      throw new BadRequestException('L\'ID de la salle doit être un entier positif valide');
    }
    return this.locationService.updateSalle(idNum, nom);
  }

  @Delete('salles/:id')
  async deleteSalle(@Param('id') id: string) {
    const idNum = parseInt(id, 10);
    if (isNaN(idNum) || idNum <= 0) {
      throw new BadRequestException('L\'ID de la salle doit être un entier positif valide');
    }
    return this.locationService.deleteSalle(idNum);
  }

  @Get('coordinates')
  getLocations() {
    return this.locationService.getCoordinates();
  }

  @Get('geocode/search')
  async geocode(@Query('q') query: string) {
    if (!query) {
      throw new BadRequestException('Un terme de recherche est requis');
    }
    return this.locationService.geocodeLocation(query);
  }

  @Post('save')
  async saveLocation(@Body('query') query: string) {
    if (!query) {
      throw new BadRequestException('Un terme de recherche est requis');
    }
    return this.locationService.saveSelectedLocation(query);
  }

  // Ajouter cette nouvelle route pour la mise à jour avec géocodage
@Put('geocode/:id')
async updateLocationWithGeocode(
  @Param('id') id: string, 
  @Body('query') query: string
) {
  const idNum = parseInt(id, 10);
  if (isNaN(idNum) || idNum <= 0) {
    throw new BadRequestException('L\'ID doit être un entier positif valide');
  }
  return this.locationService.updateLocationWithGeocode(idNum, query);
}
}