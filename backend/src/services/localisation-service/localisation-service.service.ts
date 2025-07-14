// src/location/location.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Localisation } from 'src/entities/Location';
import { Salle } from 'src/entities/salle';
import { Repository } from 'typeorm';


@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Localisation)
    private readonly locationRepository: Repository<Localisation>,
    @InjectRepository(Salle)
    private readonly salleRepository: Repository<Salle>,
  ) {}

  // Créer un lieu
  async createLocation(nom: string): Promise<Localisation> {
    const location = this.locationRepository.create({ nom });
    return this.locationRepository.save(location);
  }

  // Récupérer tous les lieux
  async findAllLocations(): Promise<Localisation[]> {
    return this.locationRepository.find({ relations: ['salles'] });
  }

  // Récupérer un lieu par ID
  async findLocationById(id: number): Promise<Localisation> {
    const location = await this.locationRepository.findOne({
      where: { id },
      relations: ['salles'],
    });
    if (!location) {
      throw new BadRequestException('Lieu non trouvé');
    }
    return location;
  }

  // Créer une salle pour un lieu
  async createSalle(nom: string, locationId: number): Promise<Salle> {
    const location = await this.findLocationById(locationId);
    const salle = this.salleRepository.create({ nom, location });
    return this.salleRepository.save(salle);
  }

  // Récupérer toutes les salles d'un lieu
  async findSallesByLocation(locationId: number): Promise<Salle[]> {
    return this.salleRepository.find({
      where: { location: { id: locationId } },
    });
  }

  // Récupérer une salle par ID
  async findSalleById(id: number): Promise<Salle> {
    const salle = await this.salleRepository.findOne({
      where: { id },
      relations: ['location'],
    });
    if (!salle) {
      throw new BadRequestException('Salle non trouvée');
    }
    return salle;
  }
}