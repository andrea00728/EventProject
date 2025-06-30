// src/event/event.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Evenement } from 'src/entities/Evenement';
import { Repository } from 'typeorm';
import { LocationService } from '../localisation-service/localisation-service.service';
import { CreateEventDto } from 'src/dto/CreateEvenementDTO';

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

    const evenement = this.evenementRepository.create({
      nom: dto.nom,
      type: dto.type,
      theme: dto.theme,
      date: dto.date,
      location,
      salle,
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
}