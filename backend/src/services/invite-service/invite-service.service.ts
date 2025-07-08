import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { parse } from 'csv-parse';
import { Invite } from 'src/entities/Invite';
import { TableService } from '../table-service/table-service.service';
import { CreateInviteDto } from 'src/dto/CreateInviteDto';
import { Evenement } from 'src/entities/Evenement';
import * as streamifier from 'streamifier';
import { TableEvent } from 'src/entities/Table';

@Injectable()
export class GuestService {
  constructor(
    @InjectRepository(Invite)
    private readonly guestRepository: Repository<Invite>,
    @InjectRepository(Evenement)
    private readonly evenementRepository: Repository<Evenement>,
    private readonly tableService: TableService,

    @InjectRepository(TableEvent)
    private readonly tableRepository: Repository<TableEvent>, 
  ) {}

  async createGuest(dto: CreateInviteDto, eventId: number): Promise<Invite> {
    const evenement = await this.evenementRepository.findOne({ where: { id: eventId } });
    if (!evenement) {
      throw new BadRequestException('Événement non trouvé');
    }

    const existing = await this.guestRepository.findOne({
       where: { 
        email: dto.email,
        event:{id:eventId}
      } 
      
      });
    if (existing) {
      throw new BadRequestException(`L'email ${dto.email} est déjà utilisé.`);
    }

    const { table, place } = await this.findNextAvailablePlace(eventId);
    await this.ckeckPaymentRequirement(evenement);
    const inv = this.guestRepository.create({
      ...dto,
      event: evenement,
      table,
      place,
    });

    const saved = await this.guestRepository.save(inv);

    // Met à jour le compteur des places réservées dans la table
    await this.tableService.updatePlaceReserve(table.id);

    return this.findById(saved.id);
  }
  
// async importGuests(file: Express.Multer.File, eventId: number): Promise<{ imported: Invite[]; errors: string[] }> {
//   const evenement = await this.evenementRepository.findOne({ where: { id: eventId } });
//   if (!evenement) {
//     throw new BadRequestException('Événement non trouvé');
//   }

//   const guestsRaw: any[] = [];
//   const parser = parse({ columns: true, trim: true });
//   const stream = streamifier.createReadStream(file.buffer);

//   stream.pipe(parser);

//   return new Promise((resolve, reject) => {
//     parser.on('data', (record) => {
//       if (!record.nom || !record.prenom || !record.email || !record.sex) {
//         reject(new BadRequestException('CSV invalide : colonnes manquantes'));
//         return;
//       }
//       guestsRaw.push(record);
//     });

//     parser.on('end', async () => {
//       const savedGuests: Invite[] = [];
//       const errors: string[] = [];

//       const totalExisting = await this.guestRepository.count({
//         where: { event: { id: eventId } },
//       });

//       const totalFinal = totalExisting + guestsRaw.length;

//       console.log('✔️ Total existants:', totalExisting);
//       console.log('📄 Total CSV à importer:', guestsRaw.length);
//       console.log('💰 Montant transaction:', evenement.montanttransaction);
//       console.log('🔢 Total final:', totalFinal);

//       // Vérifie le seuil de paiement
//       if (totalFinal > 50 && (!evenement.montanttransaction || evenement.montanttransaction === 0)) {
//         reject(new BadRequestException(`❌ Vous avez atteint la limite gratuite de 50 invités. Veuillez effectuer le paiement pour continuer.`));
//         return;
//       }

//       for (const record of guestsRaw) {
//         try {
//           console.log(`➡️ Traitement de ${record.email}`);
          
//           const existing = await this.guestRepository.findOne({
//             where: {
//               email: record.email,
//               event: { id: eventId }
//             }
//           });

//           if (existing) {
//             console.log(`⚠️ L'email ${record.email} est déjà utilisé`);
//             errors.push(`L'email ${record.email} est déjà utilisé`);
//             continue;
//           }

//           const { table, place } = await this.findNextAvailablePlace(eventId);

//           const newGuest = this.guestRepository.create({
//             nom: record.nom,
//             prenom: record.prenom,
//             email: record.email,
//             sex: record.sex,
//             event: evenement,
//             table,
//             place,
//           });

//           const saved = await this.guestRepository.save(newGuest);
//           await this.tableService.updatePlaceReserve(table.id);
//           savedGuests.push(saved);
//         } catch (err) {
//           console.error(`❌ Erreur lors du traitement de ${record.email}: ${err.message}`);
//           errors.push(`Erreur pour ${record.email}: ${err.message}`);
//         }
//       }

//       console.log(`✅ Import terminé. ${savedGuests.length} invités enregistrés. ${errors.length} erreurs.`);

//       resolve({ imported: savedGuests, errors });
//     });

//     parser.on('error', (error) => {
//       console.error('❌ Erreur lors du parsing du CSV:', error.message);
//       reject(error);
//     });
//   });
// }

async importGuests(file: Express.Multer.File, eventId: number): Promise<{ imported: Invite[]; errors: string[] }> {
  const evenement = await this.evenementRepository.findOne({ where: { id: eventId } });
  if (!evenement) {
    throw new BadRequestException('Événement non trouvé');
  }

  const guestsRaw: any[] = [];
  const processedEmails = new Set<string>();
  const parser = parse({ columns: true, trim: true });
  const stream = streamifier.createReadStream(file.buffer);

  stream.pipe(parser);

  return new Promise((resolve, reject) => {
    parser.on('data', (record) => {
      if (!record.nom || !record.prenom || !record.email || !record.sex) {
        reject(new BadRequestException('CSV invalide : colonnes manquantes'));
        return;
      }
      if (processedEmails.has(record.email)) {
        console.warn(`Email ${record.email} déjà traité, ignoré.`);
        return;
      }
      processedEmails.add(record.email);
      guestsRaw.push(record);
    });

    parser.on('end', async () => {
      const savedGuests: Invite[] = [];
      const errors: string[] = [];

      const totalExisting = await this.guestRepository.count({ where: { event: { id: eventId } } });
      const totalFinal = totalExisting + guestsRaw.length;

      console.log(' Total existants:', totalExisting);
      console.log(' Total CSV à importer:', guestsRaw.length);
      console.log('Montant transaction:', evenement.montanttransaction);
      console.log(' Total final:', totalFinal);

      if (totalFinal > 50 && (!evenement.montanttransaction || evenement.montanttransaction === 0)) {
        reject(new BadRequestException('Vous avez atteint la limite gratuite de 50 invités. Veuillez effectuer le paiement pour continuer.'));
        return;
      }

      for (const record of guestsRaw) {
        try {
          console.log(` Traitement de ${record.email}`);
          const existing = await this.guestRepository.findOne({ where: { email: record.email, event: { id: eventId } } });
          if (existing) {
            errors.push(`L'email ${record.email} est déjà utilisé pour cet événement`);
            continue;
          }

          let table: any = null;
          let place: number | null = null;

          try {
            const { table: availableTable, place: availablePlace } = await this.findNextAvailablePlace(eventId);
            if (availableTable && availablePlace !== undefined && availablePlace !== null) {
              table = availableTable;
              place = availablePlace;
              await this.tableService.updatePlaceReserve(table.id);
            } else {
              errors.push(`Aucune place disponible pour ${record.email}, invité ajouté sans assignation.`);
            }
          } catch (placeError) {
            errors.push(`Erreur lors de l'assignation de place pour ${record.email}: ${placeError.message}`);
          }

          const guestData: any = {
            nom: record.nom,
            prenom: record.prenom,
            email: record.email,
            sex: record.sex,
            event: evenement,
            table: table,
          };
          if (typeof place === 'number') {
            guestData.place = place;
          }

          const newGuest = this.guestRepository.create(guestData);
          const saved = await this.guestRepository.save(newGuest);

          // Gérer le cas où save retourne un Invite ou un Invite[]
          if (Array.isArray(saved)) {
            savedGuests.push(...saved);
          } else {
            savedGuests.push(saved);
          }
        } catch (err) {
          errors.push(`Erreur pour ${record.email}: ${err.message}`);
        }
      }

      console.log(`Import terminé. ${savedGuests.length} invités enregistrés. ${errors.length} erreurs.`);
      resolve({ imported: savedGuests, errors });
    });

    parser.on('error', (error) => {
      console.error(' Erreur lors du parsing du CSV:', error.message);
      reject(error);
    });
  });
}


/**
 * 
 * @param eventId 
 * @returns 
 * Methode pour verifier si le payement est necessaire
 */
  private async ckeckPaymentRequirement(event: Evenement): Promise<void> {
    const count = await this.guestRepository.count({
      where: { event: { id: event.id } },
    });

    if (count >= 50 && !event.montanttransaction) {
      throw new BadRequestException(
        `Vous avez atteint la limite gratuite de 50 invités. Veuillez effectuer le paiement pour continuer.`
      );
    }
    return;
  }

  private async findNextAvailablePlace(eventId: number): Promise<{ table: any; place: number }> {
    const tables = await this.tableService.findByEvent(eventId);
    for (const table of tables) {
      const usedPlaces = await this.guestRepository.find({
        where: { table: { id: table.id } },
        select: ['place'],
      });

      const taken = usedPlaces.map(g => g.place);

      for (let i = 1; i <= table.capacite; i++) {
        if (!taken.includes(i)) {
          return { table, place: i };
        }
      }
    }

    throw new BadRequestException('Aucune place disponible dans les tables.');
  }

  async autoAssignGuests(eventId: number): Promise<void> {
    const guests = await this.guestRepository.find({
      where: {
        event: { id: eventId },
        table: IsNull(),
      },
    });

    const tables = await this.tableService.findByEvent(eventId);

    if (!tables.length) {
      throw new BadRequestException('Aucune table disponible pour cet événement');
    }

    let currentTableIndex = 0;
    for (const guest of guests) {
      let assigned = false;

      for (let i = 0; i < tables.length; i++) {
        const table = tables[(currentTableIndex + i) % tables.length];
        const usedPlaces = await this.guestRepository.find({
          where: { table: { id: table.id } },
          select: ['place'],
        });

        const takenPlaces = usedPlaces.map(p => p.place);

        for (let p = 1; p <= table.capacite; p++) {
          if (!takenPlaces.includes(p)) {
            await this.tableService.assignGuestToTable(guest.id, table.id, p);

            await this.tableService.updatePlaceReserve(table.id);

            assigned = true;
            currentTableIndex = (currentTableIndex + i + 1) % tables.length;
            break;
          }
        }

        if (assigned) break;
      }

      if (!assigned) {
        throw new BadRequestException(`Pas assez de places pour ${guest.nom} ${guest.prenom}`);
      }
    }
  }


  async findByEvent(eventId: number): Promise<Invite[]> {
  return this.guestRepository.find({
    where: { event: { id: eventId } },
    relations: ['event', 'table'],
    select: {
      id: true,
      nom: true,
      prenom: true,
      email: true,
      sex: true,
      place: true,
      table: {
        id: true,
        numero: true,
      },
    },
  });
}


  async update(id: number, data: Partial<Invite>): Promise<Invite> {
    await this.guestRepository.update(id, data);
    const invite = await this.guestRepository.findOne({
      where: { id },
      relations: ['event', 'table'],
    });

    if (!invite) {
      throw new BadRequestException(`Invité avec ID ${id} non trouvé`);
    }

    return invite;
  }

  async findById(id: number): Promise<Invite> {
    const invite = await this.guestRepository.findOne({
      where: { id },
      relations: ['event', 'table'],
    });

    if (!invite) {
      throw new BadRequestException(`Invité avec ID ${id} non trouvé`);
    }
    return invite;
  }


  async findLastEventByUser(userId: string): Promise<Evenement | null> {
  return this.evenementRepository.findOne({
    where: { user: { id: userId } },
    order: { id: 'DESC' },
  });
}


async deleteById(id: number, userId: string): Promise<{ message: string }> {
  const invite = await this.guestRepository.findOne({
    where: { id },
    relations: ['event', 'table', 'event.user'],
  });
  if (!invite) {
    throw new BadRequestException(`Invité avec ID ${id} non trouvé`);
  }
  if (invite.event.user.id !== userId) {
    throw new BadRequestException(`Accès refusé à cet invité`);
  }
  if (invite.table) {
    await this.tableService.decrementPlaceReserve(invite.table.id);
  }
  await this.guestRepository.delete(id);
  return { message: `Invité avec ID ${id} supprimé avec succès` };
}




async assignGuestToTable(id: number, tableId: number, place: number, userId: string): Promise<Invite> {
  const guest = await this.guestRepository.findOneOrFail({ where: { id }, relations: ['event', 'table'] });
  if (guest.event.user.id !== userId) {
    throw new UnauthorizedException('Accès non autorisé');
  }

  const table = await this.tableRepository.findOneOrFail({ where: { id: tableId }, relations: ['event'] });
  if (table.event.id !== guest.event.id) {
    throw new BadRequestException('La table ne correspond pas à l\'événement de l\'invité');
  }

  if (table.placeReserve >= table.capacite) {
    throw new BadRequestException('Capacité de la table atteinte');
  }

  if (guest.table && guest.place) {
    // Si l'invité est déjà assigné, libérer l'ancienne place
    const oldTable = await this.tableRepository.findOneOrFail({ where: { id: guest.table.id } });
    oldTable.placeReserve = Math.max(0, oldTable.placeReserve - 1);
    await this.tableRepository.save(oldTable);
  }

  guest.table = table;
  guest.place = place;
  table.placeReserve += 1;
  await this.tableRepository.save(table);
  return this.guestRepository.save(guest);
}

}
