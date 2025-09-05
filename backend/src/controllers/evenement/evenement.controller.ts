import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  BadRequestException,
  UseGuards,
  Req,
  UnauthorizedException,
  Delete,
  UploadedFile,
  UseInterceptors,
  Patch,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateEventDto } from 'src/dto/CreateEvenementDTO';
import { UpdateEventDto } from 'src/dto/UpdateEvenementDTO';
import { Evenement } from 'src/entities/Evenement';
import { EvenementService } from 'src/services/evenement/evenement.service';
import { ForfaitService } from 'src/services/forfait/forfait.service';
import * as path from 'path';
import * as fs from 'fs';

@Controller('evenements')
export class EvenementController {
  constructor(
    private readonly evenementService: EvenementService,
    private readonly forfaitService: ForfaitService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateEventDto,
    @Req() req: any
  ): Promise<Evenement> {
    const userIdFromToken = req.user?.sub;
    if (!userIdFromToken) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }

    await this.forfaitService.checkForfaitExpiration(userIdFromToken);

    const canCreateEvent = await this.forfaitService.canCreateEvent(userIdFromToken);
    if (!canCreateEvent) {
      throw new BadRequestException("Vous avez atteint le nombre maximum d'événements");
    }
    dto.utilisateur_id = userIdFromToken;

    if (file) {
      const uploadDir = path.join(__dirname, '../../../Uploads/events');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      const fileName = `${Date.now()}-${file.originalname}`;
      const filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, file.buffer);

      dto.imageUrl = `/uploads/events/${fileName}`;
    }

    try {
      return await this.evenementService.create(dto);
    } catch (error) {
      if (error.code === '23505') {
        throw new BadRequestException("Vous avez déjà créé un événement avec ce nom.");
      }
      throw new BadRequestException(error.message || "Erreur lors de la création de l'événement");
    }
  }

@Patch(':id')
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(FileInterceptor('image'))
async update(
  @Param('id') id: string,
  @Body() dto: UpdateEventDto,
  @Req() req: any,
  @UploadedFile() file?: Express.Multer.File,
): Promise<Evenement> {
  const userId = req.user?.sub;
  if (!userId) throw new UnauthorizedException('Utilisateur non authentifié');

  await this.forfaitService.checkForfaitExpiration(userId);

  const event = await this.evenementService.findOneById(+id);
  if (!event || event.user.id !== userId) {
    throw new UnauthorizedException("Vous n'êtes pas autorisé à modifier cet événement");
  }

  try {
    const updatedEvent = await this.evenementService.update(+id, { ...dto, image: file }, userId);
    console.log('Réponse de update:', updatedEvent);
    return updatedEvent;
  } catch (error) {
    console.error('Erreur dans update:', error);
    throw new BadRequestException(error.message || "Erreur lors de la mise à jour de l'événement");
  }
}

  @Get('/me')
  @UseGuards(AuthGuard('jwt'))
  async findUserEvenement(@Req() req: any): Promise<Evenement[]> {
    const userIdFromToken = req.user?.sub;
    if (!userIdFromToken) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }
    return this.evenementService.findByUser(userIdFromToken);
  }

  @Get()
  async findAll() {
    return this.evenementService.findAll();
  }

  @Get('/countEvent')
  async findCountEvents(): Promise<number> {
    return this.evenementService.findCountEvents();
  }

  @Get('publics')
  async findPublicEvents(): Promise<Evenement[]> {
    return this.evenementService.findPublicEvents();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.evenementService.findOne(+id);
  }

  @Delete(':id/delete')
  @UseGuards(AuthGuard('jwt'))
  async deleteEvent(@Param('id') id: number, @Req() req: any): Promise<{ message: string }> {
    const userIdFromToken = req.user?.sub;
    if (!userIdFromToken) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }
    return this.evenementService.deleteEvent(id, userIdFromToken);
  }

  @Get(':id/managerEvents')
  async findManagerEvents(@Param('id') id: string) {
    return this.evenementService.findManagerEvents(id);   
  }

  @Get('/events/statistics')
  async findCountForAllEventStats(): Promise<any> {
    return this.evenementService.findCountForAllEventStats();   
  }
}