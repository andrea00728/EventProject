import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual, Not } from 'typeorm';
import { Evenement } from 'src/entities/Evenement';
import { UpdateEventDto } from 'src/dto/UpdateEvenementDTO';
import { LocationService } from '../localisation-service/localisation-service.service';
import { User } from 'src/Authentication/entities/auth.entity';
import { NotificationService } from '../notification/notification.service';
import { NotificationEntity } from 'src/entities/notification.entity';
import { NotificationGateway } from 'src/gateway/notification.gateway';
import { CreateEventDto } from 'src/dto/CreateEvenementDTO';
import * as fs from 'fs/promises';

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

      const user = await this.userRepo.findOneBy({ id: dto.utilisateur_id });
      if (!user) throw new NotFoundException('Utilisateur introuvable');

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

      // Notification pour tous
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

  async update(id: number, dto: UpdateEventDto & { image?: Express.Multer.File }, userId: string): Promise<Evenement> {
    try {
      const evenement = await this.findOneById(id);
      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (!user) throw new NotFoundException('Utilisateur non trouvé');

      const date = dto.date ? new Date(dto.date) : evenement.date;
      const date_fin = dto.date_fin ? new Date(dto.date_fin) : evenement.date_fin;
      if (isNaN(date.getTime()) || isNaN(date_fin.getTime())) {
        throw new BadRequestException('Dates invalides');
      }

      let location = evenement.location;
      let salle = evenement.salle;

      if (dto.locationId || dto.latitude !== undefined || dto.longitude !== undefined || dto.nomLieu) {
        location = await this.locationService.updateOrCreateLocation({
          id: dto.locationId ? Number(dto.locationId) : evenement.location?.id,
          nom: dto.nomLieu || evenement.location?.nom,
          latitude: dto.latitude !== undefined ? Number(dto.latitude) : evenement.location?.latitude ?? undefined,
          longitude: dto.longitude !== undefined ? Number(dto.longitude) : evenement.location?.longitude ?? undefined,
          createurId: userId,
        });
      }

      if (dto.salleId) {
        salle = await this.locationService.findSalleById(Number(dto.salleId));
        if (!salle || !location || salle.location.id !== location.id) {
          throw new BadRequestException('La salle ne correspond pas au lieu');
        }
      }

      const conflict = await this.evenementRepository.findOne({
        where: {
          salle: { id: salle?.id },
          date: LessThanOrEqual(date_fin),
          date_fin: MoreThanOrEqual(date),
          id: Not(id),
        },
      });
      if (conflict) throw new BadRequestException('Conflit de réservation pour cette salle');

      Object.assign(evenement, {
        nom: dto.nom ?? evenement.nom,
        type: dto.type ?? evenement.type,
        theme: dto.theme ?? evenement.theme,
        date,
        date_fin,
        location,
        salle,
        user,
        isPublic: dto.isPublic ?? evenement.isPublic,
        imageUrl: dto.image ? await this.handleImageUpload(dto.image) : evenement.imageUrl,
      });

      const updatedEvent = await this.evenementRepository.save(evenement);
      console.log('Événement mis à jour:', updatedEvent);
      return updatedEvent;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'événement:', error);
      throw error;
    }
  }

  private async handleImageUpload(file: Express.Multer.File): Promise<string | null> {
    if (!file) return null;
    const fileName = `${Date.now()}-${file.originalname}`;
    const uploadPath = `./Uploads/Evenements/${fileName}`;
    await fs.writeFile(uploadPath, file.buffer);
    return `/Uploads/Evenements/${fileName}`;
  }

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

      await this.evenementRepository.manager.delete('Invite', { event: { id } });
      await this.evenementRepository.manager.delete('TableEvent', { event: { id } });
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