// src/location/location.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Evenement } from 'src/entities/Evenement';
import { Localisation } from 'src/entities/Location';
import { Salle } from 'src/entities/salle';
import { DataSource, Repository } from 'typeorm';


@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Localisation)
    private readonly locationRepository: Repository<Localisation>,
    @InjectRepository(Salle)
    private readonly salleRepository: Repository<Salle>,

    @InjectRepository(Evenement)
    private evenementRepository: Repository<Evenement>,
    private dataSource: DataSource,
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

  async updateLocation(id: number, nom: string): Promise<Localisation> {
    const location = await this.findLocationById(id); // Reuses existing method to check if location exists
    if (!nom) {
      throw new BadRequestException('Le nom du lieu est requis');
    }
    location.nom = nom;
    return this.locationRepository.save(location);
  }

  async deleteLocation(id: number): Promise<void> {
    const location = await this.findLocationById(id);
    if (location.salles.length > 0) {
      throw new BadRequestException('Impossible de supprimer un lieu avec des salles associées');
    }
    await this.locationRepository.delete(id);
  }

  async updateSalle(id: number, nom: string): Promise<Salle> {
    const salle = await this.findSalleById(id); // Reuses existing method to check if salle exists
    if (!nom) {
      throw new BadRequestException('Le nom de la salle est requis');
    }
    salle.nom = nom;
    return this.salleRepository.save(salle);
  }


  // src/services/localisation-service/localisation-service.service.ts
  async deleteSalle(id: number): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check for dependent evenement records
      const evenementCount = await this.evenementRepository.count({ where: { salleId: id } });
      if (evenementCount > 0) {
        throw new BadRequestException(
          `Impossible de supprimer la salle avec l'ID ${id}, car elle est référencée par ${evenementCount} événement(s).`,
        );
      }

      // Delete the salle record
      await queryRunner.manager.delete(Salle, { id });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}