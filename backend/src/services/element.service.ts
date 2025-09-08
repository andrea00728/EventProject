import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evenement } from 'src/entities/Evenement';
import { CreateElementDto } from 'src/dto/CreateElementDto'; // À créer
// import { NotificationService } from './notification/notification.service';
import { Element } from 'src/entities/Element';
import { NotificationService } from './notification/notification.service';

@Injectable()
export class ElementService {
  constructor(
    @InjectRepository(Element)
    private readonly elementRepository: Repository<Element>,
    @InjectRepository(Evenement)
    private readonly eventRepository: Repository<Evenement>,
    private readonly notificationService: NotificationService,
  ) {}

  async createElement(dto: CreateElementDto, utilisateurId: string): Promise<Element[]> {
    if (!dto || dto.nom === undefined || !dto.eventId || !dto.type) {
      throw new BadRequestException('Données de création d\'élément incomplètes');
    }

    const event = await this.eventRepository.findOne({
      where: {
        id: dto.eventId,
        user: { id: utilisateurId },
      },
      relations: ['user'],
    });

    if (!event) {
      throw new UnauthorizedException("Cet événement n'appartient pas à l'utilisateur connecté");
    }

    const elements: Element[] = [];
    const nombre = dto.nombre || 1;

    for (let i = 1; i <= nombre; i++) {
      const nomElement = `${dto.nom}-${i}`;

      const existing = await this.elementRepository.findOne({
        where: {
          nom: nomElement,
          event: { id: dto.eventId },
        },
      });

      if (existing) continue;

      const element = this.elementRepository.create({
        nom: nomElement,
        type: dto.type,
        position: dto.position || { left: 0, top: 0 },
        rotation: dto.rotation || 0,
        width: dto.width,
        height: dto.height,
        event,
      });

      const saved = await this.elementRepository.save(element);
      elements.push(saved);
    }

    await this.notificationService.notifyAll(
      'Éléments ajoutés',
      `${elements.length} nouveaux éléments ont été ajoutés à l’événement ${event.nom}.`,
    );

    return elements;
  }

  async findByEvent(eventId: number): Promise<Element[]> {
    return this.elementRepository.find({
      where: { event: { id: eventId } },
      relations: ['event'],
    });
  }

  async updateElementPosition(elementId: number, position: { left: number; top: number }): Promise<Element> {
    const element = await this.elementRepository.findOne({
      where: { id: elementId },
      relations: ['event'],
    });

    if (!element) {
      throw new BadRequestException(`Élément avec ID ${elementId} non trouvé`);
    }

    element.position = position;
    return this.elementRepository.save(element);
  }

  async updateElementRotation(elementId: number, rotation: number): Promise<Element> {
    const element = await this.elementRepository.findOne({
      where: { id: elementId },
      relations: ['event'],
    });

    if (!element) {
      throw new BadRequestException(`Élément avec ID ${elementId} non trouvé`);
    }

    element.rotation = rotation;
    return this.elementRepository.save(element);
  }

  async updateElement(id: number, data: Partial<Element>): Promise<Element> {
    await this.elementRepository.update(id, data);
    const element = await this.elementRepository.findOne({
      where: { id },
      relations: ['event'],
    });

    if (!element) {
      throw new BadRequestException(`Élément avec ID ${id} non trouvé`);
    }

    return element;
  }

  async deleteElement(elementId: number): Promise<void> {
    await this.elementRepository.delete(elementId);
  }
}