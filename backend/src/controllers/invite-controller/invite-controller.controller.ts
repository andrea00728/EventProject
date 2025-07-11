import {Controller,Post, Body,Param, Get, UploadedFile, UseInterceptors, ParseIntPipe, Put, HttpException, HttpStatus, Req, UseGuards, Delete, BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateInviteDto } from 'src/dto/CreateInviteDto';
import { Invite } from 'src/entities/Invite';
import { TableEvent } from 'src/entities/Table';
import { GuestService } from 'src/services/invite-service/invite-service.service';

@Controller('guests')
export class GuestController {
  constructor(private readonly guestService: GuestService) {}

  /**
   * 
   * @param dto 
   * @param req 
   * @returns 
   * creation dínvite lie au evenement precedent
   */

 @Post('/create')
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() dto: CreateInviteDto, @Req() req): Promise<Invite> {
    console.log("user connecte:",req.user);
    const userId = req.user?.sub;
    if (!userId) throw new HttpException('Utilisateur non authentifié', HttpStatus.UNAUTHORIZED);

    const lastEvent = await this.guestService.findLastEventByUser(userId);
    if (!lastEvent) throw new HttpException('Aucun événement trouvé pour cet utilisateur', HttpStatus.BAD_REQUEST);

    const guest = await this.guestService.createGuest(dto, lastEvent.id,userId);
    return this.guestService.findById(guest.id);
  }

 
  /**
   * 
   * @param file 
   * @param req 
   * @returns 
   *  // Importer un fichier CSV avec des invités, sans eventId côté client
   */
  @Post('import')
   @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  async importGuests(@UploadedFile() file: Express.Multer.File, @Req() req): Promise<Invite[]> {
    if (!file) throw new HttpException('Aucun fichier fourni.', HttpStatus.BAD_REQUEST);

    const userId = req.user?.sub;
    if (!userId) throw new HttpException('Utilisateur non authentifié', HttpStatus.UNAUTHORIZED);

    const lastEvent = await this.guestService.findLastEventByUser(userId);
    if (!lastEvent) throw new HttpException('Aucun événement trouvé pour cet utilisateur', HttpStatus.BAD_REQUEST);

    const result = await this.guestService.importGuests(file, lastEvent.id,userId);
    return result.imported;
  }

  /**
   * 
   * @param file 
   * @param eventId 
   * @param req 
   * @returns 
   * //  Importer des invités pour un ÉVÉNEMENT SPÉCIFIQUE**
   */


@Post('import/:eventId') 
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(FileInterceptor('file'))
async importGuestsToSpecificEvent(
  @UploadedFile() file: Express.Multer.File,
  @Param('eventId', ParseIntPipe) eventId: number,
  @Req() req,
) {
  if (!file) {
    throw new HttpException('Aucun fichier fourni.', HttpStatus.BAD_REQUEST);
  }

  const userId = req.user?.sub;
  if (!userId) {
    throw new HttpException('Utilisateur non authentifié', HttpStatus.UNAUTHORIZED);
  }

  const evenement = await this.guestService['evenementRepository'].findOne({
    where: { id: eventId, user: { id: userId } },
  });

  if (!evenement) {
    throw new HttpException('Événement introuvable ou non autorisé', HttpStatus.NOT_FOUND);
  }

  const result = await this.guestService.importGuests(file, eventId, userId);


  if (result.imported.length === 0 && result.errors.length > 0) {
    throw new BadRequestException(result.errors.join('\n'));
  }


  return {
    message: 'Importation terminée.',
    invites_importes: result.imported,
    erreurs: result.errors,
  };
}




  /**
   * 
   * @param req 
   * @returns 
   * // Récupérer tous les invités du dernier événement de l'utilisateur connecté
   */

  @Get('last-event')
   @UseGuards(AuthGuard('jwt'))
  async getGuestsByLastEvent(@Req() req): Promise<Invite[]> {
    const userId = req.user?.sub;
    if (!userId) throw new HttpException('Utilisateur non authentifié', HttpStatus.UNAUTHORIZED);

    const lastEvent = await this.guestService.findLastEventByUser(userId);
    if (!lastEvent) throw new HttpException('Aucun événement trouvé pour cet utilisateur', HttpStatus.BAD_REQUEST);

    return await this.guestService.findByEvent(lastEvent.id);
  }


  /**
   * 
   * @param id 
   * @param req 
   * @returns 
   *  //Récupérer les invités d’un événement spécifique
   */

    @Get('event/:id')
    @UseGuards(AuthGuard('jwt'))
    async getGuestsByEvent(@Param('id', ParseIntPipe) id: number, @Req() req): Promise<Invite[]> {
      const userId = req.user?.sub;
      if (!userId) throw new HttpException('Utilisateur non authentifié', HttpStatus.UNAUTHORIZED);

      // Optionnel : tu peux vérifier que l’événement appartient bien à l'utilisateur ici
      const guests = await this.guestService.findByEvent(id);
      return guests;
    }



/**
 * 
 * @param eventId 
 * @param req 
 * @returns 
 * /  Récupérer les invités d’un événement spécifique**
 */
  @Get(':eventId') 
  @UseGuards(AuthGuard('jwt'))
  async getGuestsByEventId(
    @Param('eventId', ParseIntPipe) eventId: number, // <- Utilisez ParseIntPipe ici
    @Req() req,
  ): Promise<Invite[]> {
    const userId = req.user?.sub;
    if (!userId) {
      throw new HttpException('Utilisateur non authentifié', HttpStatus.UNAUTHORIZED);
    }
    const evenement = await this.guestService['evenementRepository'].findOne({
        where: { id: eventId, user: { id: userId } },
    });
    if (!evenement) {
      throw new HttpException('Événement introuvable ou non autorisé pour cet utilisateur', HttpStatus.NOT_FOUND);
    }
    return await this.guestService.findByEvent(eventId); 
  }





     
 /**
  * 
  * @param id 
  * @param updateDto 
  * @returns 
  *  // Mise à jour d’un invité 
  */
  @Put(':id')
   @UseGuards(AuthGuard('jwt'))
  async updateGuest(@Param('id', ParseIntPipe) id: number, @Body() updateDto: Partial<Invite>): Promise<Invite> {
    return await this.guestService.update(id, updateDto);
  }



  /**
   * 
   * @param eventId 
   * @param createInviteDto 
   * @param req 
   * @returns 
   * // creation invite specifique
   */

 @Post(':eventId') 
  @UseGuards(AuthGuard('jwt'))
  async createInviteForSpecificEvent(
    @Param('eventId', ParseIntPipe) eventId: number, 
    @Body() createInviteDto: CreateInviteDto,
    @Req() req,
  ): Promise<Invite> {
    const userId = req.user?.sub;
    if (!userId) {
      throw new HttpException('Utilisateur non authentifié', HttpStatus.UNAUTHORIZED);
    }
    return await this.guestService.createGuest(createInviteDto, eventId,userId);
  }

  /**
   * 
   * @param id 
   * @param req 
   * @returns 
   * //supprimer invite
   */
  
  @Delete(':id')
@UseGuards(AuthGuard('jwt'))
async deleteGuest(
  @Param('id', ParseIntPipe) id: number,
  @Req() req,
): Promise<{ message: string }> {
  const userId = req.user?.sub;
  if (!userId) {
    throw new HttpException('Utilisateur non authentifié', HttpStatus.UNAUTHORIZED);
  }
  return await this.guestService.deleteById(id, userId);
}

@Get('tables/:eventId')
@UseGuards(AuthGuard('jwt'))
async getTablesByEventId(
  @Param('eventId', ParseIntPipe) eventId: number,
  @Req() req,
): Promise<TableEvent[]> {
  const userId = req.user?.sub;
  if (!userId) throw new HttpException('Utilisateur non authentifié', HttpStatus.UNAUTHORIZED);

  const event = await this.guestService['evenementRepository'].findOne({ where: { id: eventId, user: { id: userId } } });
  if (!event) throw new HttpException('Événement introuvable ou non autorisé', HttpStatus.NOT_FOUND);

  return this.guestService['tableRepository'].find({ where: { event: { id: eventId } } });
}


@Post(':id/assign')
  @UseGuards(AuthGuard('jwt'))
  async assignGuestToTable(
    @Param('id', ParseIntPipe) id: number,
    @Body() { tableId, place }: { tableId: number; place: number },
    @Req() req,
  ): Promise<Invite> {
    const userId = req.user?.sub;
    if (!userId) throw new HttpException('Utilisateur non authentifié', HttpStatus.UNAUTHORIZED);

    const guest = await this.guestService.findById(id);
    if (!guest) throw new HttpException('Invité non trouvé', HttpStatus.NOT_FOUND);

    const event = await this.guestService['evenementRepository'].findOne({ where: { id: guest.event.id, user: { id: userId } } });
    if (!event) throw new HttpException('Événement non autorisé pour cet utilisateur', HttpStatus.FORBIDDEN);

    return await this.guestService.assignGuestToTable(id, tableId, place, userId);
  }
}


