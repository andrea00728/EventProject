import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Evenement } from 'src/entities/Evenement';
import { Localisation } from 'src/entities/Location';
import { Salle } from 'src/entities/salle';
import { DataSource, FindOptionsWhere, IsNull, Repository } from 'typeorm';
import { ILike } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { User } from 'src/Authentication/entities/auth.entity';


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


  async createLocation(data: {
    nom: string;
    latitude?: number;
    longitude?: number;
    createurId?: number;
  }): Promise<Localisation> {
    const { nom, latitude, longitude, createurId = 0 } = data; // Default to 0 for admin/system-created
    const existing = await this.locationRepository.findOne({ where: { nom } });
    if (existing) {
      throw new BadRequestException('Un lieu avec ce nom existe déjà');
    }
  
    // Validate creator if provided
    let user: User | undefined;
    if (createurId !== 0) {
      const foundUser = await this.userRepository.findOne({ where: { id: createurId.toString() } });
      user = foundUser || undefined;
      if (!user) {
        throw new BadRequestException("L'ID de l'organisateur est invalide");
      }
    }
  
    const location = this.locationRepository.create({
      nom,
      latitude,
      longitude,
      createur: user || undefined, // Set to undefined for admin/system-created locations
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

  async updateLocation(id: number, data: {
    nom: string;
    latitude?: number;
    longitude?: number;
    createur?: 'organisateur' | 'admin';
  }): Promise<Localisation> {
    const location = await this.findLocationById(id);
    const { nom, latitude, longitude, createur } = data;
    
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
      if (evenementCount > 0) {
        throw new BadRequestException(
          `Impossible de supprimer la salle avec l'ID ${id}, car elle est référencée par ${evenementCount} événement(s).`,
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
      const response = await this.httpService.get(url).toPromise();
      if (!response) {
        throw new BadRequestException('Erreur lors de la géocodage : Réponse indéfinie');
      }
      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        return {
          lat: parseFloat(result.lat),
          lon: parseFloat(result.lon),
          displayName: result.display_name,
        };
      }
      throw new BadRequestException('Aucun résultat trouvé pour cette recherche');
    } catch (error) {
      throw new BadRequestException('Erreur lors de la géocodage : ' + (error.message || 'Erreur inconnue'));
    }
  }

  async saveSelectedLocation(query: string, createurId: string): Promise<Localisation> {
    const geocodeResult = await this.geocodeLocation(query);

    // Vérifier si une localisation existe avec le même nom ou les mêmes coordonnées
    const existingLocation = await this.locationRepository.findOne({
      where: [
        { nom: geocodeResult.displayName },
        {
          latitude: geocodeResult.lat,
          longitude: geocodeResult.lon,
        },
      ],
      relations: ['createur'],
    });

    if (existingLocation) {
      // Si le lieu existe mais n'a pas de créateur, essayer de mettre à jour avec l'utilisateur actuel
      if (!existingLocation.createur && createurId && createurId !== '0') {
        const user = await this.userRepository.findOne({ where: { id: createurId } });
        if (user) {
          existingLocation.createur = user;
          return this.locationRepository.save(existingLocation);
        }
      }
      return existingLocation;
    }

    // Valider le créateur
    let user: User | undefined;
    if (createurId && createurId !== '0') {
      const foundUser = await this.userRepository.findOne({ where: { id: createurId } });
      if (!foundUser) {
        throw new BadRequestException("L'ID de l'organisateur est invalide");
      }
      user = foundUser;
    }

    // Créer une nouvelle localisation
    const newLocation = this.locationRepository.create({
      nom: geocodeResult.displayName,
      latitude: geocodeResult.lat,
      longitude: geocodeResult.lon,
      createur: user, // Sera undefined pour admin (createurId = 0)
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
  

  //recuperer les lieux par createur
  async findLocationsByCreator(createurId: string): Promise<Localisation[]> {
    if (!createurId) {
      throw new BadRequestException("L'ID du créateur est requis");
    }

    // Cas où createurId = '0' (admin, createur_id est NULL en base)
    if (createurId === '0') {
      return this.locationRepository.find({
        where: { createur: IsNull() },
        relations: ['salles', 'createur'],
        order: { nom: 'ASC' },
      });
    }

    // Vérifier si l'utilisateur existe
    const user = await this.userRepository.findOne({ where: { id: createurId } });
    if (!user) {
      throw new BadRequestException("L'ID de l'organisateur est invalide");
    }

    // Rechercher les lieux pour l'utilisateur donné
    return this.locationRepository.find({
      where: { createur: { id: createurId } },
      relations: ['salles', 'createur'],
      order: { nom: 'ASC' },
    });
  }


  //lieux crée par utilisateur + celle de l'admin
  async findLocationsByCreatorAndAdmin(createurId: string): Promise<Localisation[]> {
    if (!createurId) {
      throw new BadRequestException("L'ID du créateur est requis");
    }

    // Préparer les conditions de recherche
    const whereConditions: FindOptionsWhere<Localisation>[] = [];

    // Inclure les lieux créés par l'admin (createur_id = NULL)
    whereConditions.push({ createur: IsNull() });

    // Si createurId n'est pas '0', inclure les lieux de l'utilisateur connecté
    if (createurId !== '0') {
      const user = await this.userRepository.findOne({ where: { id: createurId } });
      if (!user) {
        throw new BadRequestException("L'ID de l'organisateur est invalide");
      }
      whereConditions.push({ createur: { id: createurId } });
    }

    // Rechercher les lieux pour l'admin et l'utilisateur connecté
    return this.locationRepository.find({
      where: whereConditions,
      relations: ['salles', 'createur'],
      order: { nom: 'ASC' },
    });
  }
  
}