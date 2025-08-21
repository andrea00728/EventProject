
import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateTableDto } from 'src/dto/CreateTaleDto';
import { Invite } from 'src/entities/Invite';
import { TableEvent } from 'src/entities/Table';
import { Evenement } from 'src/entities/Evenement';
import { QrCodeService } from '../qrcode/qrcode.service';
import { NotificationService } from '../notification/notification.service';
@Injectable()
export class TableService {
  constructor(
    @InjectRepository(TableEvent)
    private readonly tableRepository: Repository<TableEvent>,
    @InjectRepository(Invite)
    private readonly guestRepository: Repository<Invite>,
    @InjectRepository(Evenement)
    private readonly eventRepository:Repository<Evenement>,
    private readonly qrCodeService: QrCodeService,
    private readonly notificationService:NotificationService,
  ) {}

// async createTable(dto: CreateTableDto, utilisateurId: string): Promise<TableEvent> {
//   if (!dto || dto.nom === undefined || dto.capacite === undefined || !dto.eventId) {
//     throw new BadRequestException('Données de création de table incomplètes');
//   }
//   // Vérifier que l'événement existe et appartient bien à l'utilisateur
//   const event = await this.eventRepository.findOne({
//     where: {
//       id: dto.eventId,
//       user: { id: utilisateurId }
//     },
//     relations: ['user']
//   });

//   if (!event) {
//     throw new UnauthorizedException("Cet événement n'appartient pas à l'utilisateur connecté");
//   }

//   // Vérification du numéro de table déjà utilisé
//   const existingTable = await this.tableRepository.findOne({
//     where: {
//       nom: dto.nom,
//       event: { id: dto.eventId }
//     }
//   });
//   if (existingTable) {
//     throw new BadRequestException("Le numéro de table est déjà utilisé pour cet événement.");
//   }

//   const table = this.tableRepository.create({
//     nom: dto.nom,
//     capacite: dto.capacite,
//     type: dto.type,
//     position: dto.position || { left: 0, top: 0 },
//     event
//   });

//     // Sauvegarder la table pour obtenir un ID
//   const savedTable = await this.tableRepository.save(table);

//   // Générer le QR code pour la table
//   savedTable.qrCode = await this.qrCodeService.generateQrCodeForTable(dto.eventId, savedTable.id)
  
//   const table_event=await this.tableRepository.save(table);
//   await this.notificationService.notifyAll(
//     'Nouvelle table ajoutée',
//     `Une nouvelle table numero ${table_event.nom  } a été ajouté pour l'événement ${event.nom}.`,
//   );

//   return table_event;
// }


async createTable(dto: CreateTableDto & { nombre?: number }, utilisateurId: string): Promise<TableEvent[]> {
  if (!dto || dto.nom === undefined || dto.capacite === undefined || !dto.eventId) {
    throw new BadRequestException('Données de création de table incomplètes');
  }

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

  const tables: TableEvent[] = [];
  const nombre = dto.nombre || 1;

  for (let i = 1; i <= nombre; i++) {
    const nomTable = `${dto.nom}-${i}`;

    const existing = await this.tableRepository.findOne({
      where: {
        nom: nomTable,
        event: { id: dto.eventId }
      }
    });

    if (existing) continue;

    const table = this.tableRepository.create({
      nom: nomTable,
      capacite: dto.capacite,
      type: dto.type,
      position: dto.position || { left: 0, top: 0 },
      event
    });

    const saved = await this.tableRepository.save(table);
    saved.qrCode = await this.qrCodeService.generateQrCodeForTable(dto.eventId, saved.id);
    await this.tableRepository.save(saved);

    tables.push(saved);
  }

  await this.notificationService.notifyAll(
    'Tables ajoutées',
    `${tables.length} nouvelles tables ont été ajoutées à l’événement ${event.nom}.`,
  );

  return tables;
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
    relations: ['guests', 'event'],
  });
}

    /**
     * 
     * @param tableId 
     * //decrementation du place si linvite supprimer
     */

  async decrementPlaceReserve(tableId: number): Promise<void> {
  const table = await this.tableRepository.findOne({ where: { id: tableId } });
  if (!table) {
    throw new BadRequestException(`Table avec ID ${tableId} non trouvée`);
  }

  table.placeReserve = Math.max(0, table.placeReserve - 1); // éviter négatif
  await this.tableRepository.save(table);
}



/**
 * 
 * @param id 
 * @param data 
 * @returns 
 * mettre a jour les tables
 */

async updateTable(id: number, data: Partial<TableEvent>): Promise<TableEvent> {
  await this.tableRepository.update(id, data);
  const table = await this.tableRepository.findOne({
    where: { id },
    relations: ['guests', 'event'],
  });
  if (!table) {
    throw new BadRequestException(`Table avec ID ${id} non trouvée`);
  }

  // Régénérer le QR code si l'eventId ou l'ID de la table change
  if (data.event || data.id) {
    table.qrCode = await this.qrCodeService.generateQrCodeForTable(table.event.id, table.id);
    await this.tableRepository.save(table);
  }

  return table;
}

//   async DeleteTable(id: number, userId: number): Promise<{ message: string }> {
//   // Récupérer la table avec ses relations
//   const table = await this.tableRepository.findOne({
//     where: { id },
//     relations: ['event', 'event.user', 'guests'],
//   });

//   // Vérifier si la table existe
//   if (!table) {
//     throw new BadRequestException("Table non trouvée");
//   }

//   // Vérifier que la table appartient bien à l'utilisateur connecté
//   if (table.event.user.id !== userId) {
//     throw new UnauthorizedException("Vous n'avez pas l'autorisation de supprimer cette table");
//   }

//   // Détacher les invités associés à cette table
//   for (const guest of table.guests) {
//     guest.table = null;
//     guest.place = null;
//     await this.guestRepository.save(guest);
//   }

//   // Supprimer la table
//   await this.tableRepository.remove(table);

//   return { message: "Table supprimée avec succès" };
// }


 async updateTablePosition(tableId: number, position: { left: number; top: number }): Promise<TableEvent> {
    const table = await this.tableRepository.findOne({
      where: { id: tableId },
      relations: ['guests', 'event'],
    });

    if (!table) {
      throw new BadRequestException(`Table avec ID ${tableId} non trouvée`);
    }

    table.position = position;
    return this.tableRepository.save(table);
  }

  async updateRotation(tableId: number, rotation: number): Promise<TableEvent> {
    const table = await this.tableRepository.findOne({
      where: { id: tableId },
      relations: ['guests', 'event'],
    });
    if (!table) {
      throw new BadRequestException(`Table avec ID ${tableId} non trouvée`);
    }
    table.rotation = rotation;
    return this.tableRepository.save(table);
  }

  /**
   * 
   * @param tableId 
   * suppression table par leur id
   */
  async deleteTableEvent(tableId: number): Promise<void> {
     await this.tableRepository.delete(tableId);
  }


}