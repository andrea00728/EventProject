import { Injectable, BadRequestException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { parse } from 'csv-parse';
import { Invite } from 'src/entities/Invite';
import { TableService } from '../table-service/table-service.service';
import { CreateInviteDto } from 'src/dto/CreateInviteDto';
import { Evenement } from 'src/entities/Evenement';
import * as streamifier from 'streamifier';
import { TableEvent } from 'src/entities/Table';
import { User } from 'src/Authentication/entities/auth.entity';
import { NotificationService } from '../notification/notification.service';
import { PersonnelService } from '../personnel/personnel.service';

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
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly notificationservice:NotificationService,
    private readonly personnelService:PersonnelService,
  ) {}

  async createGuest(dto: CreateInviteDto, eventId: number,userId:string): Promise<Invite> {
    const evenement = await this.evenementRepository.findOne({ where: { id: eventId } });
    if (!evenement) {
      throw new BadRequestException('Événement non trouvé');
    }

    await this.checkInviteLimit(eventId,userId,1)

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
  /**
   * (nasiko commentaire satry tsy miasa lony)
   */
    // await this.ckeckPaymentRequirement(evenement);
    const inv = this.guestRepository.create({
      ...dto,
      event: evenement,
      table,
      place,
    });
    const saved = await this.guestRepository.save(inv);
    await this.notificationservice.notifyAll(
      'invite cree avec success',
      `${saved.nom} ${saved.prenom} a ete ajoute comme invite de l'evenement ${evenement.nom}`,
    )
  
    // Met à jour le compteur des places réservées dans la table
    await this.tableService.updatePlaceReserve(table.id);

    return this.findById(saved.id);
  }
  

async importGuests(file: Express.Multer.File, eventId: number,userId:string): Promise<{ imported: Invite[]; errors: string[] }> {
  const evenement = await this.evenementRepository.findOne({ 
    where: { id: eventId },
    relations:['user']
  });
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

      try {
        await this.checkInviteLimit( eventId, userId,guestsRaw.length);
      } catch (limitErr) {
        errors.push(`Limite forfait dépassée: ${limitErr.message}`);
        return resolve({ imported: [], errors }); // Pas de throw ici
      }
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


/***
 * methode central pour les limites de cretion et importation d'invite
 */
  async checkInviteLimit(eventId: number,userId: string,newInviteCount:number): Promise<void> {
    const user= await this.userRepository.findOne({
      where:{id:userId},
      relations:['forfait'],
    });
    if(!user){
      throw new BadRequestException('Utilisateur non trouvé');
    }

    const maxinvites=user.forfait?.maxinvites;
    /**
     * applique pour forfait gold parce que l'rganisateur n'a pas de limite si fait une abonnement gold
     */
    if(!maxinvites) return;

    const currentCount=await this.guestRepository.count({
      where:{event:{id:eventId}},
    });
    if(currentCount+newInviteCount>maxinvites){
    throw new BadRequestException(`Vous avez atteint la limite gratuite de ${maxinvites} invités. Veuillez effectuer un abonnement pour continuer.`);
    }
  }


/**
 * 
 * @param eventId 
 * @returns 
 * Methode pour verifier si le payement est necessaire  (asorina avie)
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



async rassignGuestToTable(id: number, tableId: number, place: number, userId: string) {
  try {
    const guest = await this.guestRepository.findOne({
      where: { id },
      relations: ['event', 'event.user', 'table'],
    });

    if (!guest || guest.event.user.id !== userId) {
      throw new UnauthorizedException('Accès non autorisé');
    }

    const newTable = await this.tableRepository.findOneBy({ id: tableId });
    if (!newTable) throw new BadRequestException('Table non trouvée');

    const placeTaken = await this.guestRepository.findOne({
      where: { table: { id: tableId }, place },
    });

    if (placeTaken && placeTaken.id !== id) {
      throw new BadRequestException('Place non disponible');
    }

    const oldTableId = guest.table?.id;

    guest.table = newTable;
    guest.place = place;

    const updatedGuest = await this.guestRepository.save(guest);
    if (oldTableId && oldTableId !== newTable.id) {
      await this.tableService.updatePlaceReserve(oldTableId);
    }
    await this.tableService.updatePlaceReserve(newTable.id);

    return updatedGuest;
  } catch (err) {
    console.error("Erreur lors du déplacement des invités :", err);
    throw new BadRequestException(err.message);
  }
}



/**
 * 
 * @param guestId 
 * @param eventId 
 * @returns 
 * 
 * utilise pour le verification de l'invite via sont qrCode
 */

async findOneByIdAndEvent(guestId:number,eventId:number) {
  return this.guestRepository.findOne(
    {where:
    {id:guestId,event:{id:eventId}},
    relations:['event','table']
  });
}

async updateforQrcode(id:number,guest:Partial<Invite>){
 await this.guestRepository.update(id,guest)
 await this.guestRepository.findOneBy({id:id})
}



/**
 * 
 * compte línvite  present et abscent
 * 
 */

async countCheckinByPersonnel(userEmail: string) {
  const personnel = await this.personnelService.findOneByUserEmail(userEmail);
  const eventId = personnel?.evenement.id;
  
  if(!personnel ||  personnel.role !=='accueil'){
     console.error('Accès refusé pour cet utilisateur');
      throw new ForbiddenException('Vous n\'avez pas d\'accès pour cet événement');
  }
  const repo=this.guestRepository;
  const [checkedIn,notCheckedIn]=await Promise.all([
     repo.count({ where: { event: { id: eventId }, ckeckedIn: true } }),
     repo.count({ where: { event: { id: eventId }, ckeckedIn: false } }),
  ]);
   console.log('Résultats:', { checkedIn, notCheckedIn });
   return {
    checkedIn,
    notCheckedIn,
}
}

async findEventIdByEmail(userEmail: string): Promise<any> {
  if (!userEmail) {
    throw new BadRequestException("Email de l'utilisateur manquant");
  }

  const personnel = await this.personnelService.findOneByUserEmail(userEmail);

  if (!personnel || personnel.role !== 'cuisinier' && personnel.role !== 'caissier') {
    throw new BadRequestException("Vous n'avez pas accès à cet événement !!!");
  }

  const eventId = Number(personnel?.evenement?.id);

  if (!eventId || isNaN(eventId)) {
    throw new BadRequestException("Aucun événement valide trouvé pour ce cuisinier");
  }

  return { eventId };

}
}