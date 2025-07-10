// src/event/event.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Evenement } from 'src/entities/Evenement';
import { Between, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
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

  // Vérifier que la salle appartient bien au lieu
  if (salle.location.id !== location.id) {
    throw new BadRequestException('La salle ne correspond pas au lieu sélectionné');
  }

  // Validation des dates reçues
  const parsedDate = new Date(dto.date);
  const parsedDateFin = new Date(dto.date_fin);

  if (isNaN(parsedDate.getTime()) || isNaN(parsedDateFin.getTime())) {
    throw new BadRequestException('La date ou la date de fin est invalide');
  }

  // Vérifie s'il y a chevauchement d’événements dans cette salle
  const existingEvent = await this.evenementRepository.findOne({
    where: {
      salle: { id: dto.salleId },
      date: LessThanOrEqual(parsedDateFin), 
      date_fin: MoreThanOrEqual(parsedDate), 
    },
    relations: ['user'],
  });

  if (existingEvent) {
    throw new BadRequestException(`Cette salle est déjà réservée pendant cette période`);
  }

  // Création de l'utilisateur (juste référence par id)
  const user = new User();
  user.id = dto.utilisateur_id;

  // Création de l'événement avec dates bien parsées
  const evenement = this.evenementRepository.create({
    nom: dto.nom,
    type: dto.type,
    theme: dto.theme,
    date: parsedDate,
    date_fin: parsedDateFin,
    location,
    salle,
    user,
  });

  // Sauvegarde en base
  return this.evenementRepository.save(evenement);
}

/**
 * 
 * @returns 
 * creation table par evenement specifique
 * 
 */

async findOneById(eventId: number): Promise<Evenement> {
  const event = await this.evenementRepository.findOne({
    where: { id: eventId },
    relations: ['user'],
  });
  if(!event){
    throw new NotFoundException(`Événement avec ID ${eventId} non trouvé`)
  }
  return event;
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
      user: { id: utilisateur_id }
    },
    relations: ['user', 'location', 'salle','tables','invites'], 
  });
}

//recuperation dernier evenement creer
async findLastEventByUserId(userId: string): Promise<Evenement | null> {
  return this.evenementRepository.findOne({
    where: { user: { id: userId } },
    order: { id: 'DESC' },
  });
}

/**
 * requete de suppression d'un evenement
 */


async deleteEvent(id: number, userId: string): Promise<{ message: string }> {
  const event = await this.evenementRepository.findOne({
    where: { id, user: { id: userId } },
    relations: ['user', 'tables', 'invites'],
  });
  if (!event) {
    throw new NotFoundException(`Événement avec ID ${id} non trouvé ou vous n'avez pas la permission de le supprimer`);
  }
  // Supprimer tous les invités liés à cet événement
  await this.evenementRepository.manager.delete('Invite', { event: { id } });
  // Supprimer toutes les tables liées à cet événement
  await this.evenementRepository.manager.delete('TableEvent', { event: { id } });
  await this.evenementRepository.remove(event);
  return { message: 'Événement supprimé avec succès' };
}

}