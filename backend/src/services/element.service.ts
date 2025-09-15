import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evenement } from 'src/entities/Evenement';
import { CreateElementDto } from 'src/dto/CreateElementDto';
import { Element } from 'src/entities/Element';
import { NotificationService } from './notification/notification.service';
import { User } from 'src/Authentication/entities/auth.entity';

@Injectable()
export class ElementService {
  constructor(
    @InjectRepository(Element)
    private readonly elementRepository: Repository<Element>,
    @InjectRepository(Evenement)
    private readonly eventRepository: Repository<Evenement>,
    private readonly notificationService: NotificationService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findOneById(elementId: number): Promise<Element | null> {
    return this.elementRepository.findOne({
      where: { id: elementId },
      relations: ['event', 'event.user'],
    });
  }

async createElement(dto: CreateElementDto, utilisateurId: string): Promise<Element[]> {
  if (!dto || dto.nom === undefined || !dto.eventId || !dto.type) {
    throw new BadRequestException("Données de création d'élément incomplètes");
  }

  if (dto.type === 'custom' && !dto.shape) {
    throw new BadRequestException(
      'Le champ shape est requis pour un élément personnalisé',
    );
  }

  // Vérifier que l’événement appartient bien à l’utilisateur
  const event = await this.eventRepository.findOne({
    where: { id: dto.eventId, user: { id: utilisateurId } },
    relations: ['user'],
  });

  if (!event) {
    throw new UnauthorizedException(
      "Cet événement n'appartient pas à l'utilisateur connecté",
    );
  }

  // Récupérer l’utilisateur + son forfait
  const user = await this.userRepo.findOne({
    where: { id: utilisateurId },
    relations: ['forfait'],
  });
  if (!user) throw new UnauthorizedException();

  // Règles de limitation selon le forfait
  const nomForfait = user.forfait.nom.toLowerCase();
  let maxElements: number | null; // null = illimité

  switch (nomForfait) {
    case 'freemium':
      throw new BadRequestException(
        "Votre forfait 'Freemium' ne permet pas de créer des objets.",
      );
    case 'starter':
      maxElements = 5;
      break;
    case 'pro':
      maxElements = 15;
      break;
    case 'premium':
      maxElements = 30;
      break;
    case 'gold':
      maxElements = null; // illimité
      break;
    default:
      maxElements = 1000; // sécurité si forfait inconnu
  }

  // Vérifier la limite seulement si elle est définie
  if (maxElements !== null) {
    const current = await this.elementRepository.count({
      where: { event: { id: dto.eventId } },
    });
    const nombre = dto.nombre || 1;

    if (current + nombre > maxElements) {
      throw new BadRequestException(
        `Limite atteinte : votre forfait ${user.forfait.nom} autorise ${maxElements} éléments maximum.`,
      );
    }
  }

  // Création des éléments
  const elements: Element[] = [];
  const nombre = dto.nombre || 1;

  for (let i = 1; i <= nombre; i++) {
    const nomElement = `${dto.nom}-${i}`;

    const existing = await this.elementRepository.findOne({
      where: { nom: nomElement, event: { id: dto.eventId } },
    });
    if (existing) continue;

    const element = this.elementRepository.create({
      nom: nomElement,
      type:
        dto.type === 'custom' && dto.customTypeName
          ? dto.customTypeName
          : dto.type,
      position: dto.position || { left: 0, top: 0 },
      rotation: dto.rotation || 0,
      width: dto.width,
      height: dto.height,
      color: dto.color || '#d1d5db',
      shape: dto.shape || 'rectangle',
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
  const elements = await this.elementRepository.find({
    where: { event: { id: eventId } },
    relations: ['event'],
  });
  console.log('Éléments récupérés:', elements); // Vérifiez si `shape` est présent
  return elements;
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
    // Validation pour shape si type est "custom"
    if (data.type === 'custom' && data.shape && !['rond', 'carre', 'rectangle', 'triangle'].includes(data.shape)) {
      throw new BadRequestException('Forme invalide pour un élément personnalisé');
    }

    await this.elementRepository.update(id, {
      ...data,
      shape: data.type === 'custom' ? data.shape : null, // Assurer que shape est null pour non-custom
    });

    const element = await this.elementRepository.findOne({
      where: { id },
      relations: ['event'],
    });

    if (!element) {
      throw new BadRequestException(`Élément avec ID ${id} non trouvé`);
    }

    return element;
  }

  async deleteElement(elementId: number, userId: string): Promise<void> {
    const element = await this.elementRepository.findOne({
      where: { id: elementId },
      relations: ['event', 'event.user'],
    });
    if (!element) {
      throw new NotFoundException(`Élément avec ID ${elementId} non trouvé`);
    }
    if (element.event.user.id !== userId) {
      throw new UnauthorizedException("Cet élément n'appartient pas à l'utilisateur connecté");
    }
    await this.elementRepository.delete(elementId);
  }
}