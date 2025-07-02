// src/event/event.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Evenement } from 'src/entities/Evenement';
import { Between, Repository } from 'typeorm';
import { LocationService } from '../localisation-service/localisation-service.service';
import { CreateEventDto } from 'src/dto/CreateEvenementDTO';
import { User } from 'src/Authentication/entities/auth.entity';

@Injectable()
export class EvenementService {
  constructor(
    @InjectRepository(Evenement)
    private readonly evenementRepository: Repository<Evenement>,
    private readonly locationService: LocationService,
  ) {}

  async create(dto: CreateEventDto): Promise<Evenement> {
    // Valider le lieu
    const location = await this.locationService.findLocationById(dto.locationId);
    // Valider la salle
    const salle = await this.locationService.findSalleById(dto.salleId);

    // Vérifier que la salle appartient au lieu
    if (salle.location.id !== location.id) {
      throw new BadRequestException('La salle ne correspond pas au lieu sélectionné');
    }

    const eventDate = new Date(dto.date);
const startOfDay = new Date(eventDate);
startOfDay.setHours(0, 0, 0, 0);

const endOfDay = new Date(eventDate);
endOfDay.setHours(23, 59, 59, 999);

// Vérifier si la salle est déjà réservée ce jour-là
const existingEvent = await this.evenementRepository.findOne({
  where: {
    salle: { id: dto.salleId },
    date: Between(startOfDay, endOfDay),
  },
});

if (existingEvent) {
  throw new BadRequestException(`Cette salle est déjà réservée à cette date`);
}
   const user = new User();
user.id = dto.utilisateur_id;

const evenement = this.evenementRepository.create({
  nom: dto.nom,
  type: dto.type,
  theme: dto.theme,
  date: dto.date,
  location,
  salle,
  user,  // relation user
});

    return this.evenementRepository.save(evenement);
  }

  
  async findAll(): Promise<Evenement[]> {
    return this.evenementRepository.find({ relations: ['location', 'salle', 'tables', 'invites'] });
  }

  async findOne(id: number): Promise<Evenement> {
    const evenement = await this.evenementRepository.findOne({
      where: { id },
      relations: ['location', 'salle', 'tables', 'invites'],
    });
    if (!evenement) {
      throw new BadRequestException('Événement non trouvé');
    }
    return evenement;
  }
  async findByUser(utilisateur_id: string): Promise<Evenement[]> {
  console.log('utilisateur_id reçu :', utilisateur_id);
  return this.evenementRepository.find({
    where: { 
      user:{id:utilisateur_id}
     },
    relations: ['user'], 
  });
}

//recuperation dernier evenement creer
async findLastEventByUserId(userId: string): Promise<Evenement | null> {
  return this.evenementRepository.findOne({
    where: { user: { id: userId } },
    order: { id: 'DESC' },
  });
}

}