import { Controller, Post, Body, Get, Param, BadRequestException, Put, Delete } from '@nestjs/common';
import { LocationService } from 'src/services/localisation-service/localisation-service.service';
import { Query } from '@nestjs/common';

@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post()
  async createLocation(
    @Body('nom') nom: string,
    @Body('latitude') latitude: number,
    @Body('longitude') longitude: number,
    @Body('createur') createur: 'organisateur' | 'admin' = 'organisateur'
  ) {
    if (!nom || nom.trim().length === 0) {
      throw new BadRequestException('Le nom du lieu est requis et ne peut pas être vide');
    }
    if (latitude !== undefined && (isNaN(latitude) || latitude < -90 || latitude > 90)) {
      throw new BadRequestException('La latitude doit être un nombre valide entre -90 et 90');
    }
    if (longitude !== undefined && (isNaN(longitude) || longitude < -180 || longitude > 180)) {
      throw new BadRequestException('La longitude doit être un nombre valide entre -180 et 180');
    }
    if (createur && !['organisateur', 'admin'].includes(createur)) {
      throw new BadRequestException('Le créateur doit être soit "organisateur" soit "admin"');
    }
    return this.locationService.createLocation({ nom, latitude, longitude, createurId: createur === 'admin' ? 0 : undefined });
  }

  @Get()
  findLocations(@Query('search') search?: string) {
    if (search?.trim()) {
      return this.locationService.findLocationsBySearch(search.trim());
    }
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
    if (!nom?.trim()) {
      throw new BadRequestException('Le nom de la salle est requis et ne peut pas être vide');
    }
    const idNum = parseInt(locationId, 10);
    if (isNaN(idNum) || idNum <= 0) {
      throw new BadRequestException('L\'ID du lieu doit être un entier positif valide');
    }
    return this.locationService.createSalle(nom.trim(), idNum);
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
  async updateLocation(
    @Param('id') id: string,
    @Body('nom') nom: string,
    @Body('latitude') latitude: number,
    @Body('longitude') longitude: number,
    @Body('createur') createur: 'organisateur' | 'admin'
  ) {
    const idNum = parseInt(id, 10);
    if (isNaN(idNum) || idNum <= 0) {
      throw new BadRequestException('L\'ID doit être un entier positif valide');
    }
    if (!nom?.trim()) {
      throw new BadRequestException('Le nom du lieu est requis et ne peut pas être vide');
    }
    if (latitude !== undefined && (isNaN(latitude) || latitude < -90 || latitude > 90)) {
      throw new BadRequestException('La latitude doit être un nombre valide entre -90 et 90');
    }
    if (longitude !== undefined && (isNaN(longitude) || longitude < -180 || longitude > 180)) {
      throw new BadRequestException('La longitude doit être un nombre valide entre -180 et 180');
    }
    if (createur && !['organisateur', 'admin'].includes(createur)) {
      throw new BadRequestException('Le créateur doit être soit "organisateur" soit "admin"');
    }
    return this.locationService.updateLocation(idNum, { nom: nom.trim(), latitude, longitude, createur });
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
    if (!nom?.trim()) {
      throw new BadRequestException('Le nom de la salle est requis et ne peut pas être vide');
    }
    return this.locationService.updateSalle(idNum, nom.trim());
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
    if (!query?.trim()) {
      throw new BadRequestException('Un terme de recherche est requis');
    }
    return this.locationService.geocodeLocation(query.trim());
  }

  @Post('save')
  async saveLocation(@Body() body: { query: string, createurId?: string }) {
    const { query, createurId } = body;
    if (!query?.trim()) {
      throw new BadRequestException('Un terme de recherche est requis');
    }
    return this.locationService.saveSelectedLocation(query.trim(), createurId || '');
  }

  @Put('geocode/:id')
  async updateLocationWithGeocode(@Param('id') id: string, @Body('query') query: string) {
    const idNum = parseInt(id, 10);
    if (isNaN(idNum) || idNum <= 0) {
      throw new BadRequestException('L\'ID doit être un entier positif valide');
    }
    if (!query?.trim()) {
      throw new BadRequestException('Un terme de recherche est requis');
    }
    return this.locationService.updateLocationWithGeocode(idNum, query.trim());
  }

  //recuperation des lieu par createur
  @Get('by-creator/:createurId')
  async findLocationsByCreator(@Param('createurId') createurId: string) {
    return this.locationService.findLocationsByCreator(createurId);
  }

  //recuperation des lieu par createur et admin
  @Get('byadminandcreator/:createurId')
  async findLocationsByCreatorAndAdmin(@Param('createurId') createurId: string) {
    return this.locationService.findLocationsByCreatorAndAdmin(createurId);
  }
}