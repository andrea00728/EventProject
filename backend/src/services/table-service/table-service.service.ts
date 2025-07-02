
import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTableDto } from 'src/dto/CreateTaleDto';
import { Invite } from 'src/entities/Invite';
import { TableEvent } from 'src/entities/Table';
import { Evenement } from 'src/entities/Evenement';

@Injectable()
export class TableService {
  constructor(
    @InjectRepository(TableEvent)
    private readonly tableRepository: Repository<TableEvent>,
    @InjectRepository(Invite)
    private readonly guestRepository: Repository<Invite>,
    @InjectRepository(Evenement)
    private readonly eventRepository:Repository<Evenement>,
  ) {}

  async createTable(dto: CreateTableDto, utilisateurId: string): Promise<TableEvent> {
  if (!dto || dto.numero === undefined || dto.capacite === undefined || !dto.eventId) {
    throw new BadRequestException('Données de création de table incomplètes');
  }
  // Vérifier que l'événement existe et appartient bien à l'utilisateur
  const event = await this.eventRepository.findOne({
    where: {
      id: dto.eventId,
      user: { id: utilisateurId }
    },
    relations: ['user']
  });

  if (!event) {
    throw new UnauthorizedException("Cet événement n'appartient pas à l'utilisateur connecté");
  }

  const table = this.tableRepository.create({
    numero: dto.numero,
    capacite: dto.capacite,
    type:dto.type,
    event
  });

  return this.tableRepository.save(table);
}



  async assignGuestToTable(guestId: number, tableId: number, seatNumber: number): Promise<TableEvent> {
    const table = await this.tableRepository.findOne({
      where: { id: tableId },
      relations: ['guests'],
    });
    if (!table) {
      throw new BadRequestException('Table non trouvée');
    }
    const invite = await this.guestRepository.findOne({ where: { id: guestId } });
    if (!invite) {
      throw new BadRequestException('Invité non trouvé');
    }
    if (table.placeReserve + seatNumber > table.capacite) {
      throw new BadRequestException('Table est pleine');
    }

    // Mettre à jour la relation bidirectionnelle
    invite.table = table;
    invite.place = seatNumber;
    if (!table.guests) {
      table.guests = [];
    }
    table.guests.push(invite);
    table.placeReserve += seatNumber;

    await this.guestRepository.save(invite);
    await this.tableRepository.save(table);

    // Recharger la table avec les relations
    const updatedTable = await this.tableRepository.findOne({
      where: { id: tableId },
      relations: ['guests'],
    });
    if (!updatedTable) {
      throw new BadRequestException('Erreur lors du rechargement de la table');
    }
    return updatedTable;
  }

  async getAvailableSeats(tableId: number): Promise<number> {
    const table = await this.tableRepository.findOne({ where: { id: tableId } });
    if (!table) {
      throw new BadRequestException('Table non trouvée');
    }
    return table.capacite - table.placeReserve;
  }
async updatePlaceReserve(tableId: number): Promise<void> {
  const count = await this.guestRepository.count({
    where: { table: { id: tableId } },
  });

  await this.tableRepository.update(tableId, { placeReserve: count });
}


  async findByEvent(eventId: number): Promise<TableEvent[]> {
    return this.tableRepository.find({
      where: { event: { id: eventId } },
      relations: ['guests'],
    });
  }

    //decrementation du place si linvite supprimer
  async decrementPlaceReserve(tableId: number): Promise<void> {
  const table = await this.tableRepository.findOne({ where: { id: tableId } });
  if (!table) {
    throw new BadRequestException(`Table avec ID ${tableId} non trouvée`);
  }

  table.placeReserve = Math.max(0, table.placeReserve - 1); // éviter négatif
  await this.tableRepository.save(table);
}

}