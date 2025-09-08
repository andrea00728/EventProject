import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Evenement } from 'src/entities/Evenement';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { LocationService } from '../localisation-service/localisation-service.service';
import { CreateEventDto } from 'src/dto/CreateEvenementDTO';
import { User } from 'src/Authentication/entities/auth.entity';
import { NotificationService } from '../notification/notification.service';
import { NotificationEntity } from 'src/entities/notification.entity';
import { NotificationGateway } from 'src/gateway/notification.gateway';

@Injectable()
export class EvenementService {
  constructor(
    @InjectRepository(Evenement)
    private readonly evenementRepository: Repository<Evenement>,
    private readonly locationService: LocationService,
    private readonly notificationService: NotificationService,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,
    private readonly notificationGateway: NotificationGateway
  ) {}

  async create(dto: CreateEventDto): Promise<Evenement> {
    const location = await this.locationService.findLocationById(dto.locationId);
    const salle = await this.locationService.findSalleById(dto.salleId);
    if (salle.location.id !== location.id) {
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
    if (!user) {
      throw new NotFoundException("Utilisateur introuvable");
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
    });

    console.log("evenement: ", evenement);

    const event = await this.evenementRepository.save(evenement);
    await this.notificationService.notifyAll(
      'Nouvel Événement',
      `Le nouvel Événement ${event.nom} a bien été créé`
    );

    const notification = this.notificationRepository.create({
      title: 'Nouvel évènement crée',
      message: `${user.name} a crée l'evenement de ${evenement.nom}.`,
      type: 'info',
      date: new Date(),
    });
    console.log("voici le contenu de user: ", user);
    await this.notificationRepository.save(notification);
    this.notificationGateway.emitNotifEventForAdmin({
      ...notification,
      date: notification.date.toISOString(),
    });

    return event;
  }

  async findOneById(eventId: number): Promise<Evenement> {
    const event = await this.evenementRepository.findOne({
      where: { id: eventId },
      relations: ['user'],
    });
    if (!event) {
      throw new NotFoundException(`Événement avec ID ${eventId} non trouvé`);
    }
    return event;
  }

  async findAll(): Promise<Evenement[]> {
    return this.evenementRepository.find({ relations: ['location', 'salle', 'tables', 'invites', 'user', 'user.forfait'] });
  }

  async findOne(id: number): Promise<Evenement> {
    if (!id || isNaN(id)) {
      throw new BadRequestException('ID non valide');
    }
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
    const event = await this.evenementRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['user', 'tables', 'invites'],
    });
    if (!event) {
      throw new NotFoundException(`Événement avec ID ${id} non trouvé ou vous n'avez pas la permission de le supprimer`);
    }

    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException("Utilisateur introuvable");
    }

    // notification pour la suppression d'un evenement
    const notification = this.notificationRepository.create({
      title: 'Suppression d\'un évènement',
      message: `${user.name} a supprimé l'evenement de ${event.nom}.`,
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
    return { message: 'Événement supprimé avec succès' };
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

  // *** Nouvelle méthode : récupérer les événements publics ***
  async findPublicEvents(): Promise<Evenement[]> {
    return this.evenementRepository.find({
      where: { isPublic: true },
      relations: ['location', 'salle', 'tables', 'invites', 'user'],
      order: { date: 'ASC' },
    });
  }

  /*** */

  async findCountForAllEventStats(): Promise<{
    total: number;
    passes: number;
    avenir: number;
    eventTypeStat: any;
  }> {
    const now = new Date();

    const total = await this.evenementRepository.count();

    const passes = await this.evenementRepository.count({
      where: {
        date_fin: LessThanOrEqual(now),
      },
    });

    const avenir = await this.evenementRepository.count({
      where: {
        date_fin: MoreThanOrEqual(now),
      },
    });

    const eventTypeStats = await this.userRepo
      .createQueryBuilder('user')
      .leftJoin('user.evenement', 'evenement')
      .select('evenement.type', 'type')
      .addSelect('COUNT(evenement.type)', 'total')
      .groupBy('evenement.type')
      .getRawMany();

    const eventTypeStat = eventTypeStats.map((r) => {
      const count = parseFloat(r.total);
      const percentage = total > 0 ? (count / total) * 100 : 0;
      return {
        type: r.type,
        total: count,
        percentage: parseFloat(percentage.toFixed(2)), // garde 2 chiffres après la virgule
      };
    });

    return {
      total,
      passes,
      avenir,
      eventTypeStat
    };
  }

}
