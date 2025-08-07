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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateEventDto } from 'src/dto/CreateEvenementDTO';
import { Evenement } from 'src/entities/Evenement';
import { EvenementService } from 'src/services/evenement/evenement.service';
import { ForfaitService } from 'src/services/forfait/forfait.service';

@Controller('evenements')
export class EvenementController {
  constructor(
    private readonly evenementService: EvenementService,
    private readonly forfaitService: ForfaitService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() dto: CreateEventDto, @Req() req: any): Promise<Evenement> {
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

    try {
      return await this.evenementService.create(dto);
    } catch (error) {
      if (error.code === '23505') {
        throw new BadRequestException("Vous avez déjà créé un événement avec ce nom.");
      }
      throw error;
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
  //@UseGuards(AuthGuard('jwt'))  
  async findCountForAllEventStats() : Promise<any> {
    return this.evenementService.findCountForAllEventStats();   
  }

}
