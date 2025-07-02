import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  UploadedFile,
  UseInterceptors,
  ParseIntPipe,
  Put,
  HttpException,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateInviteDto } from 'src/dto/CreateInviteDto';
import { Invite } from 'src/entities/Invite';
import { GuestService } from 'src/services/invite-service/invite-service.service';

@Controller('guests')
export class GuestController {
  constructor(private readonly guestService: GuestService) {}

  // Créer un invité manuellement
//  @Post('/create/:eventId')
//   async create(@Body() dto: CreateInviteDto, @Param('eventId') eventId: number): Promise<Invite> {
//     const guest = await this.guestService.createGuest(dto, eventId);
//     return this.guestService.findById(guest.id);
//   }
  
//   // Importer un fichier CSV avec des invités
//   @Post('import/:eventId')
//   @UseInterceptors(FileInterceptor('file'))
//   async importGuests(
//     @UploadedFile() file: Express.Multer.File,
//     @Param('eventId', ParseIntPipe) eventId: number,
//   ): Promise<Invite[]> {
//     if (!file) {
//       throw new HttpException('Aucun fichier fourni.', HttpStatus.BAD_REQUEST);
//     }
//     return await this.guestService.importGuests(file, eventId);
//   }

//   // Récupérer tous les invités d’un événement
//   @Get('event/:eventId')
//   async getGuestsByEvent(
//     @Param('eventId', ParseIntPipe) eventId: number,
//   ): Promise<Invite[]> {
//     return await this.guestService.findByEvent(eventId);
//   }

//   // Mise à jour d’un invité
//   @Put(':id')
//   async updateGuest(
//     @Param('id', ParseIntPipe) id: number,
//     @Body() updateDto: Partial<Invite>,
//   ): Promise<Invite> {
//     return await this.guestService.update(id, updateDto);
//   }

 @Post('/create')
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() dto: CreateInviteDto, @Req() req): Promise<Invite> {
    const userId = req.user?.sub;
    if (!userId) throw new HttpException('Utilisateur non authentifié', HttpStatus.UNAUTHORIZED);

    const lastEvent = await this.guestService.findLastEventByUser(userId);
    if (!lastEvent) throw new HttpException('Aucun événement trouvé pour cet utilisateur', HttpStatus.BAD_REQUEST);

    const guest = await this.guestService.createGuest(dto, lastEvent.id);
    return this.guestService.findById(guest.id);
  }

  // Importer un fichier CSV avec des invités, sans eventId côté client
  @Post('import')
   @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  async importGuests(@UploadedFile() file: Express.Multer.File, @Req() req): Promise<Invite[]> {
    if (!file) throw new HttpException('Aucun fichier fourni.', HttpStatus.BAD_REQUEST);

    const userId = req.user?.sub;
    if (!userId) throw new HttpException('Utilisateur non authentifié', HttpStatus.UNAUTHORIZED);

    const lastEvent = await this.guestService.findLastEventByUser(userId);
    if (!lastEvent) throw new HttpException('Aucun événement trouvé pour cet utilisateur', HttpStatus.BAD_REQUEST);

    return await this.guestService.importGuests(file, lastEvent.id);
  }

  // Récupérer tous les invités du dernier événement de l'utilisateur connecté
  @Get('last-event')
   @UseGuards(AuthGuard('jwt'))
  async getGuestsByLastEvent(@Req() req): Promise<Invite[]> {
    const userId = req.user?.sub;
    if (!userId) throw new HttpException('Utilisateur non authentifié', HttpStatus.UNAUTHORIZED);

    const lastEvent = await this.guestService.findLastEventByUser(userId);
    if (!lastEvent) throw new HttpException('Aucun événement trouvé pour cet utilisateur', HttpStatus.BAD_REQUEST);

    return await this.guestService.findByEvent(lastEvent.id);
  }

  // Mise à jour d’un invité (peut rester comme ça)
  @Put(':id')
   @UseGuards(AuthGuard('jwt'))
  async updateGuest(@Param('id', ParseIntPipe) id: number, @Body() updateDto: Partial<Invite>): Promise<Invite> {
    return await this.guestService.update(id, updateDto);
  }
}