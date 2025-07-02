import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  ParseIntPipe,
  BadRequestException,
  Req,
  UseGuards,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateTableDto } from 'src/dto/CreateTaleDto';
import { TableEvent } from 'src/entities/Table';
import { EvenementService } from 'src/services/evenement/evenement.service';
import { TableService } from 'src/services/table-service/table-service.service';

@Controller('tables')
export class TableController {
  constructor(
    private readonly tableService: TableService,
    private readonly evenementService:EvenementService,
  ) {}

@Post('/create')
  @UseGuards(AuthGuard('jwt'))
  async createTable(@Body() dto: CreateTableDto, @Req() req): Promise<any> {
    const userId = req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }

    // récupère le dernier événement via le service événement
    const lastEvent = await this.evenementService.findLastEventByUserId(userId);
    if (!lastEvent) {
      throw new BadRequestException("Aucun événement trouvé pour cet utilisateur");
    }
    return this.tableService.createTable({
      numero: dto.numero,
      capacite: dto.capacite,
      eventId: lastEvent.id,
      type:dto.type,
    }, userId);
  }
  // Obtenir les places disponibles d'une table
  @Get(':tableId/available-seats')
  // @UseGuards(AuthGuard('jwt'))
  async getAvailableSeats(
    @Param('tableId', ParseIntPipe) tableId: number,
  ): Promise<number> {
    return await this.tableService.getAvailableSeats(tableId);
  }

  // Obtenir les tables liées à un événement
  @Get('event/:eventId')
  async getTablesByEvent(
    @Param('eventId', ParseIntPipe) eventId: number,
  ): Promise<TableEvent[]> {
    return await this.tableService.findByEvent(eventId);
  }

  // Obtenir les tables liées au dernier  événement creer par l'útilisateur connecter

   @Get('/by-last-event')
  @UseGuards(AuthGuard('jwt'))
  async getTablesByLastEvent(@Req() req): Promise<TableEvent[]> {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException('Utilisateur non authentifié');

    const lastEvent = await this.evenementService.findLastEventByUserId(userId);
    if (!lastEvent) throw new NotFoundException("Aucun événement trouvé pour l'utilisateur");

    return this.tableService.findByEvent(lastEvent.id);
  }
}