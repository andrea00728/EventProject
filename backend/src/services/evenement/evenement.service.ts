import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual, Not } from 'typeorm';
import { Evenement } from 'src/entities/Evenement';
import { LocationService } from '../localisation-service/localisation-service.service';
import { User } from 'src/Authentication/entities/auth.entity';
import { NotificationService } from '../notification/notification.service';
import { NotificationEntity } from 'src/entities/notification.entity';
import { NotificationGateway } from 'src/gateway/notification.gateway';
import { CreateEventDto, UpdateEventDto } from 'src/dto/CreateEvenementDTO';
import * as fs from 'fs';
import { Localisation } from 'src/entities/Location';
import { file } from 'googleapis/build/src/apis/file';
import * as path from 'path';

@Injectable()
export class EvenementService {
  constructor(
    @InjectRepository(Evenement)
    private readonly evenementRepository: Repository<Evenement>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,
    private readonly locationService: LocationService,
    private readonly notificationService: NotificationService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

async create(dto: CreateEventDto): Promise<Evenement> {
  try {
    const user = await this.userRepo.findOne({
      where: { id: dto.utilisateur_id },
      relations: ['forfait', 'evenement']
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    // Check event limit based on user's plan
    if (user.forfait) {
      const maxEvents = user.forfait.maxevents;
      if (maxEvents !== null && user.evenement.length >= parseInt(maxEvents, 10)) {
        throw new BadRequestException(`La limite d'événements de votre forfait (${maxEvents}) a été atteinte.`);
      }
    }

    const location = await this.locationService.findLocationById(dto.locationId);
    const salle = await this.locationService.findSalleById(dto.salleId);

    if (!salle || salle.location.id !== location.id) {
      throw new BadRequestException('La salle ne correspond pas au lieu sélectionné');
    }

    const parsedDate = new Date(dto.date);
    const parsedDateFin = new Date(dto.date_fin);
    if (isNaN(parsedDate.getTime()) || isNaN(parsedDateFin.getTime())) {
      throw new BadRequestException('La date ou la date de fin est invalide');
    }

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

    const evenement = this.evenementRepository.create({
      nom: dto.nom,
      type: dto.type,
      theme: dto.theme,
      date: parsedDate,
      date_fin: parsedDateFin,
      location,
      salle,
      user,
      isPublic: dto.isPublic,
      imageUrl: dto.imageUrl,
    });

    const event = await this.evenementRepository.save(evenement);
    console.log('Événement créé:', event);

    await this.notificationService.notifyAll(
      'Nouvel Événement',
      `Le nouvel Événement ${event.nom} a bien été créé`
    );

    const notification = this.notificationRepository.create({
      title: 'Nouvel évènement créé',
      message: `${user.name} a créé l'événement ${evenement.nom}.`,
      type: 'info',
      date: new Date(),
    });
    await this.notificationRepository.save(notification);
    this.notificationGateway.emitNotifEventForAdmin({
      ...notification,
      date: notification.date.toISOString(),
    });

    return event;
  } catch (error) {
    console.error('Erreur lors de la création de l\'événement:', error);
    throw error;
  }
}

  async findOneById(id: number): Promise<Evenement> {
    const event = await this.evenementRepository.findOne({
      where: { id },
      relations: ['user', 'location', 'salle'],
    });
    if (!event) throw new NotFoundException(`Événement ID ${id} non trouvé`);
    return event;
  }

async updateEvent(eventId: number, dto: UpdateEventDto, file?: Express.Multer.File): Promise<Evenement> {
  const event = await this.evenementRepository.findOne({
    where: { id: eventId },
    relations: ['location', 'salle', 'user'],
  });

  if (!event) throw new NotFoundException(`Événement avec ID ${eventId} non trouvé`);

  // Mise à jour des champs simples
  if (dto.nom) event.nom = dto.nom;
  if (dto.type) event.type = dto.type;
  if (dto.theme) event.theme = dto.theme;
  if (dto.date && !isNaN(Date.parse(dto.date))) event.date = new Date(dto.date);
  if (dto.date_fin && !isNaN(Date.parse(dto.date_fin))) event.date_fin = new Date(dto.date_fin);
  if (dto.isPublic !== undefined) event.isPublic = dto.isPublic;

  // Gestion de l'image
  if (file) {
    // Supprimer l'ancienne photo si elle existe
    if (event.imageUrl) {
      const oldImagePath = path.join(process.cwd(), 'uploads', path.basename(event.imageUrl));
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Mettre à jour avec la nouvelle photo
    event.imageUrl = `/uploads/${file.filename}`;
  }

  // Gestion du lieu
  let location;
  if (dto.locationId) {
    location = await this.locationService.findLocationById(Number(dto.locationId));
    event.location = location;
  } else {
    location = event.location;
  }

  // Gestion de la salle
  if (dto.salleId) {
    const salle = await this.locationService.findSalleById(Number(dto.salleId));
    if (location && salle.location.id !== location.id) {
      throw new BadRequestException('La salle ne correspond pas au lieu sélectionné');
    }
    event.salle = salle;
  }

  await this.evenementRepository.save(event);

  const user = await this.userRepo.findOneBy({ id: event?.user?.id });
  if (!user) throw new NotFoundException('Utilisateur introuvable');

  const notification = this.notificationRepository.create({
    title: "Modification d'un évènement",
    message: `${user.name} a modifié l'événement ${event.nom}.`,
    type: 'warning',
    date: new Date(),
  });
  await this.notificationRepository.save(notification);
  this.notificationGateway.emitDeleteEventForAdmin({
    ...notification,
    date: notification.date.toISOString(),
  });

  return this.evenementRepository.findOneOrFail({
    where: { id: event.id },
    relations: ['location', 'salle'],
  });
}



// private async handleImageUpload(file: Express.Multer.File): Promise<string | null> {
//   if (!file) return null;
//   const fileName = `${Date.now()}-${file.originalname}`;
//   const uploadPath = `../../../Uploads/events/${fileName}`; // Corriger le chemin
//   await fs.writeFile(uploadPath, file.buffer);
//   return `/Uploads/events/${fileName}`; // Retourner le chemin relatif
// }

  async findAll(): Promise<Evenement[]> {
    return this.evenementRepository.find({
      relations: ['location', 'salle', 'tables', 'invites', 'user', 'user.forfait'],
    });
  }

  async findOne(id: number): Promise<Evenement> {
    if (!id || isNaN(id)) throw new BadRequestException('ID non valide');
    const evenement = await this.evenementRepository.findOne({
      where: { id },
      relations: ['location', 'salle', 'tables', 'invites'],
    });
    if (!evenement) throw new NotFoundException('Événement non trouvé');
    return evenement;
  }

  async findByUser(utilisateur_id: string): Promise<Evenement[]> {
    return this.evenementRepository.find({
      where: { user: { id: utilisateur_id } },
      relations: ['user', 'location', 'salle', 'tables', 'invites'],
    });
  }

  async findLastEventByUserId(userId: string): Promise<Evenement | null> {
    return this.evenementRepository.findOne({
      where: { user: { id: userId } },
      order: { id: 'DESC' },
      relations: ['location', 'salle', 'user'],
    });
  }

async deleteEvent(id: number, userId: string): Promise<{ message: string }> {
  try {
    const event = await this.evenementRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['user', 'tables', 'invites'],
    });
    if (!event) {
      throw new NotFoundException(`Événement avec ID ${id} non trouvé ou vous n'avez pas la permission de le supprimer`);
    }

    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    // --- Supprimer l'image associée ---
    if (event.imageUrl) {
      const imagePath = path.join(process.cwd(), event.imageUrl.replace('/','\\'));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Création de la notification
    const notification = this.notificationRepository.create({
      title: "Suppression d'un évènement",
      message: `${user.name} a supprimé l'événement ${event.nom}.`,
      type: 'warning',
      date: new Date(),
    });
    await this.notificationRepository.save(notification);
    this.notificationGateway.emitDeleteEventForAdmin({
      ...notification,
      date: notification.date.toISOString(),
    });

    // Suppression des relations
    await this.evenementRepository.manager.delete('Invite', { event: { id } });
    await this.evenementRepository.manager.delete('TableEvent', { event: { id } });

    // Suppression de l'événement
    await this.evenementRepository.remove(event);

    console.log(`Événement ID ${id} supprimé`);
    return { message: 'Événement supprimé avec succès' };
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'événement:', error);
    throw error;
  }
}

  async findManagerEvents(utilisateur_id: string): Promise<Evenement[]> {
    return this.evenementRepository.find({
      where: { user: { id: utilisateur_id } },
      relations: ['user', 'location', 'salle', 'tables', 'invites', 'user.forfait'],
    });
  }

  async findCountEvents(): Promise<number> {
    return this.evenementRepository.count();
  }

  async findPublicEvents(): Promise<Evenement[]> {
    return this.evenementRepository.find({
      where: { isPublic: true },
      relations: ['location', 'salle', 'tables', 'invites', 'user'],
      order: { date: 'ASC' },
    });
  }

  async findCountForAllEventStats(): Promise<{
    total: number;
    passes: number;
    avenir: number;
    eventTypeStat: any[];
  }> {
    const now = new Date();

    const total = await this.evenementRepository.count();

    const passes = await this.evenementRepository.count({
      where: { date_fin: LessThanOrEqual(now) },
    });

    const avenir = await this.evenementRepository.count({
      where: { date_fin: MoreThanOrEqual(now) },
    });

    const eventTypeStats = await this.evenementRepository
      .createQueryBuilder('evenement')
      .select('evenement.type', 'type')
      .addSelect('COUNT(evenement.type)', 'total')
      .groupBy('evenement.type')
      .getRawMany();

    const eventTypeStat = eventTypeStats.map((r) => {
      const count = parseInt(r.total, 10);
      const percentage = total > 0 ? (count / total) * 100 : 0;
      return {
        type: r.type,
        total: count,
        percentage: parseFloat(percentage.toFixed(2)),
      };
    });

    return { total, passes, avenir, eventTypeStat };
  }
}