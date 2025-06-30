import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCommandeDto } from 'src/dto/create-commande.dto';
import { UpdateCommandeDto } from 'src/dto/update-commande.dto';
import { Commande, CommandeStatus } from 'src/entities/commande.entity';
import { MenuItem } from 'src/entities/menu-item.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CommandeService {
  constructor(
    @InjectRepository(Commande)
    private readonly commandeRepository: Repository<Commande>,

    @InjectRepository(MenuItem)
    private readonly menuItemRepository: Repository<MenuItem>,
  ) {}

  async findAll(): Promise<Commande[]> {
    return this.commandeRepository.find({ relations: ['items'] });
  }

  async findOne(id: number): Promise<Commande> {
    const commande = await this.commandeRepository.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!commande) throw new NotFoundException(`Commande ${id} introuvable`);
    return commande;
  }

  async create(dto: CreateCommandeDto): Promise<Commande> {
    const commande = this.commandeRepository.create({
      tableId: dto.tableId,
      eventId: dto.eventId,
      total: dto.total,
      statut: dto.statut ?? CommandeStatus.EN_ATTENTE,
      // createdAt est géré automatiquement par @CreateDateColumn
    });
  
    if (dto.items?.length) {
      const items = dto.items.map((itemDto) => {
        return this.menuItemRepository.create({
          nom: itemDto.nom,
          quantite: itemDto.quantite,
          prix: itemDto.prix,
          stock: itemDto.stock,
          categorieId: itemDto.categorieId,
          eventId: commande.eventId,
          // On NE PAS mettre `commande: commande` ici pour éviter les problèmes de mise à jour circulaire
        });
      });
  
      commande.items = items;
    }
  
    return this.commandeRepository.save(commande);
  }
  
  

  async update(id: number, dto: UpdateCommandeDto): Promise<Commande> {
    const commande = await this.findOne(id);

    commande.tableId = dto.tableId ?? commande.tableId;
    commande.total = dto.total ?? commande.total;
    commande.statut = dto.statut ?? commande.statut;

    if (dto.items && dto.items.length > 0) {
      // Supprimer les anciens items liés via queryBuilder (plus sûr pour relations)
      await this.menuItemRepository
        .createQueryBuilder()
        .delete()
        .where('commandeId = :id', { id })
        .execute();

      // Créer les nouveaux items
      const items = dto.items.map((itemDto) => this.menuItemRepository.create({
        nom: itemDto.nom,
        quantite: itemDto.quantite,
        prix: itemDto.prix,
        stock: itemDto.stock,
        categorieId: itemDto.categorieId,
        eventId: commande.eventId,
        commande: commande,
      }));

      commande.items = items;
    }

    return this.commandeRepository.save(commande);
  }

  async remove(id: number): Promise<void> {
    const commande = await this.findOne(id);

    if (commande.items && commande.items.length > 0) {
      await this.menuItemRepository.remove(commande.items);
    }
    await this.commandeRepository.remove(commande);
  }
}
