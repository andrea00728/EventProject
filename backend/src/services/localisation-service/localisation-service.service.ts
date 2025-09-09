import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Evenement } from 'src/entities/Evenement';
import { Localisation } from 'src/entities/Location';
import { Salle } from 'src/entities/salle'; 
import { DataSource, FindOptionsWhere, IsNull, Repository, ILike } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { User } from 'src/Authentication/entities/auth.entity';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Localisation)
    private readonly locationRepository: Repository<Localisation>,
    @InjectRepository(Salle)
    private readonly salleRepository: Repository<Salle>,
    @InjectRepository(Evenement)
    private readonly evenementRepository: Repository<Evenement>,
    private dataSource: DataSource,
    private httpService: HttpService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async updateOrCreateLocation(data: {
    id?: number;
    nom?: string;
    latitude?: number;
    longitude?: number;
    createurId?: string;
  }): Promise<Localisation> {
    const { id, nom, latitude, longitude, createurId = '0' } = data;

    // Vérifier l'existence du lieu
    let location: Localisation | null = null;
    if (id) {
      location = await this.locationRepository.findOne({ where: { id }, relations: ['createur'] });
      if (!location) throw new BadRequestException(`Lieu avec ID ${id} non trouvé`);
    } else if (latitude && longitude) {
      location = await this.locationRepository.findOne({
        where: [{ latitude, longitude }, { nom: nom || ILike(`%${nom}%`) }],
        relations: ['createur'],
      });
    }

    // Reverse geocoding si latitude/longitude fournis sans nom
    let finalNom = nom;
    if (!finalNom && latitude && longitude) {
      try {
        const response = await firstValueFrom(
          this.httpService.get(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=fr`
          )
        );
        finalNom = response.data.display_name || `Lat: ${latitude}, Lon: ${longitude}`;
      } catch (error) {
        throw new BadRequestException('Erreur lors du reverse geocoding');
      }
    }

    // Valider le créateur
    let user: User | null = null;
    if (createurId !== '0') {
      user = await this.userRepository.findOne({ where: { id: createurId } }); // Assumer que User.id est string
      if (!user) throw new BadRequestException("L'ID de l'organisateur est invalide");
    }

    // Créer ou mettre à jour
    if (location) {
      location.nom = finalNom || location.nom;
      location.latitude = latitude ?? location.latitude;
      location.longitude = longitude ?? location.longitude;
      if (user && !location.createur) location.createur = user;
    } else {
      if (!finalNom) throw new BadRequestException('Nom du lieu requis pour création');
      location = this.locationRepository.create({
        nom: finalNom,
        latitude,
        longitude,
        createur: user || undefined,
      });
    }

    return this.locationRepository.save(location);
  }

  async createLocation(data: {
    nom: string;
    latitude?: number;
    longitude?: number;
    createurId?: number;
  }): Promise<Localisation> {
    const { nom, latitude, longitude, createurId = 0 } = data;
    const existing = await this.locationRepository.findOne({ where: { nom } });
    if (existing) {
      throw new BadRequestException('Un lieu avec ce nom existe déjà');
    }

    let user: User | null = null;
    if (createurId !== 0) {
      user = await this.userRepository.findOne({ where: { id: createurId.toString() } });
      if (!user) {
        throw new BadRequestException("L'ID de l'organisateur est invalide");
      }
    }

    const location = this.locationRepository.create({
      nom,
      latitude,
      longitude,
      createur: user || undefined,
    });

    return this.locationRepository.save(location);
  }

  async findLocationsBySearch(search: string): Promise<Localisation[]> {
    return this.locationRepository.find({
      where: { nom: ILike(`${search}%`) },
      order: { nom: 'ASC' },
      relations: ['salles'],
    });
  }

  async findAllLocations(): Promise<Localisation[]> {
    return this.locationRepository.find({ relations: ['salles'] });
  }


  async createSalle(nom: string, locationId: number): Promise<Salle> {
    const location = await this.findLocationById(locationId);
    const salle = this.salleRepository.create({ nom, location });
    return this.salleRepository.save(salle);
  }

  async findSallesByLocation(locationId: number): Promise<Salle[]> {
    return this.salleRepository.find({
      where: { location: { id: locationId } },
    });
  }

 

  async updateLocation(id: number, data: {
    nom: string;
    latitude?: number;
    longitude?: number;
    createur?: 'organisateur' | 'admin';
  }): Promise<Localisation> {
    const location = await this.findLocationById(id);
    const { nom, latitude, longitude } = data;

    if (nom) location.nom = nom;
    if (latitude !== undefined) location.latitude = latitude;
    if (longitude !== undefined) location.longitude = longitude;

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
    const salle = await this.findSalleById(id);
    salle.nom = nom;
    return this.salleRepository.save(salle);
  }

  async deleteSalle(id: number): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const evenementCount = await this.evenementRepository.count({ where: { salleId: id } });
      const salle = await this.salleRepository.findOne({ where: { id } });
      if (!salle) {
        throw new BadRequestException(`Salle avec l'ID ${id} non trouvée.`);
      }
      if (evenementCount > 0) {
        throw new BadRequestException(
          `Impossible de supprimer la salle avec l'ID ${salle.nom}, car elle est référencée par ${evenementCount} événement(s).`,
        );
      }
      await queryRunner.manager.delete(Salle, { id });
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  getCoordinates() {
    return [
      { lat: 48.8566, lng: 2.3522, name: 'Paris' },
      { lat: 51.5074, lng: -0.1278, name: 'London' },
    ];
  }

  async geocodeLocation(query: string): Promise<any> {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=1`;
    try {
      const response = await firstValueFrom(this.httpService.get(url));
      if (!response || !response.data || response.data.length === 0) {
        throw new BadRequestException('Aucun résultat trouvé pour cette recherche');
      }
      const result = response.data[0];
      return {
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon),
        displayName: result.display_name,
      };
    } catch (error) {
      throw new BadRequestException('Erreur lors de la géocodage : ' + (error.message || 'Erreur inconnue'));
    }
  }

  async saveSelectedLocation(query: string, createurId: string): Promise<Localisation> {
    const geocodeResult = await this.geocodeLocation(query);

    const existingLocation = await this.locationRepository.findOne({
      where: [
        { nom: geocodeResult.displayName },
        { latitude: geocodeResult.lat, longitude: geocodeResult.lon },
      ],
      relations: ['createur'],
    });

    if (existingLocation) {
      if (!existingLocation.createur && createurId && createurId !== '0') {
        const user = await this.userRepository.findOne({ where: { id: createurId } });
        if (user) {
          existingLocation.createur = user;
          return this.locationRepository.save(existingLocation);
        }
      }
      return existingLocation;
    }

    let user: User | null = null;
    if (createurId && createurId !== '0') {
      user = await this.userRepository.findOne({ where: { id: createurId } });
      if (!user) {
        throw new BadRequestException("L'ID de l'organisateur est invalide");
      }
    }

    const newLocation = this.locationRepository.create({
      nom: geocodeResult.displayName,
      latitude: geocodeResult.lat,
      longitude: geocodeResult.lon,
      createur: user,
    });

    return this.locationRepository.save(newLocation);
  }

  async updateLocationWithGeocode(id: number, query: string): Promise<Localisation> {
    const geocodeResult = await this.geocodeLocation(query);
    const location = await this.findLocationById(id);

    location.nom = geocodeResult.displayName;
    location.latitude = geocodeResult.lat;
    location.longitude = geocodeResult.lon;

    return this.locationRepository.save(location);
  }

  async findLocationsByCreator(createurId: string): Promise<Localisation[]> {
    if (!createurId) {
      throw new BadRequestException("L'ID du créateur est requis");
    }

    if (createurId === '0') {
      return this.locationRepository.find({
        where: { createur: IsNull() },
        relations: ['salles', 'createur'],
        order: { nom: 'ASC' },
      });
    }

    const user = await this.userRepository.findOne({ where: { id: createurId } });
    if (!user) {
      throw new BadRequestException("L'ID de l'organisateur est invalide");
    }

    return this.locationRepository.find({
      where: { createur: { id: createurId } },
      relations: ['salles', 'createur'],
      order: { nom: 'ASC' },
    });
  }

  async findLocationsByCreatorAndAdmin(createurId: string): Promise<Localisation[]> {
    if (!createurId) {
      throw new BadRequestException("L'ID du créateur est requis");
    }

    const whereConditions: FindOptionsWhere<Localisation>[] = [{ createur: IsNull() }];

    if (createurId !== '0') {
      const user = await this.userRepository.findOne({ where: { id: createurId } });
      if (!user) {
        throw new BadRequestException("L'ID de l'organisateur est invalide");
      }
      whereConditions.push({ createur: { id: createurId } });
    }

    return this.locationRepository.find({
      where: whereConditions,
      relations: ['salles', 'createur'],
      order: { nom: 'ASC' },
    });
  }

  // Dans localisation-service.service.ts
async findLocationById(id: number): Promise<Localisation> {
  console.log('Recherche du lieu avec ID:', id);
  try {
    const location = await this.locationRepository.findOne({ where: { id } });
    if (!location) {
      console.log('Lieu non trouvé pour ID:', id);
      throw new NotFoundException(`Lieu avec l'ID ${id} non trouvé`);
    }
    console.log('Lieu trouvé:', location);
    return location;
  } catch (error) {
    console.error('Erreur lors de la recherche du lieu:', error);
    throw error;
  }
}

async findSalleById(id: number): Promise<Salle> {
  console.log('Recherche de la salle avec ID:', id);
  try {
    const salle = await this.salleRepository.findOne({
      where: { id },
      relations: ['location'],
    });
    if (!salle) {
      console.log('Salle non trouvée pour ID:', id);
      throw new NotFoundException(`Salle avec l'ID ${id} non trouvée`);
    }
    console.log('Salle trouvée:', salle);
    return salle;
  } catch (error) {
    console.error('Erreur lors de la recherche de la salle:', error);
    throw error;
  }
}
}