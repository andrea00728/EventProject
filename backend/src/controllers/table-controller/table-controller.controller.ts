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
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateTableDto } from 'src/dto/CreateTaleDto';
import { TableEvent } from 'src/entities/Table';
import { EvenementService } from 'src/services/evenement/evenement.service';
import { TableService } from 'src/services/table-service/table-service.service';
import { Table } from 'typeorm';

@Controller('tables')
export class TableController {
  constructor(
    private readonly tableService: TableService,
    private readonly evenementService:EvenementService,
  ) {}


  /**
   * 
   * @param dto 
   * @param req 
   * @returns 
   * creation dúne table
   */
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
  
  /**
   * 
   * @param tableId 
   * @returns 
   *  // Obtenir les places disponibles d'une table
   */
  @Get(':tableId/available-seats')
  // @UseGuards(AuthGuard('jwt'))
  async getAvailableSeats(
    @Param('tableId', ParseIntPipe) tableId: number,
  ): Promise<number> {
    return await this.tableService.getAvailableSeats(tableId);
  }

  /**
   * 
   * @param eventId 
   * @param req 
   * @returns 
   * // Obtenir les tables liées à un événement
   */


  @Get('event/:eventId')
  // async getTablesByEvent(
  //   @Param('eventId', ParseIntPipe) eventId: number,
  // ): Promise<TableEvent[]> {
  //   return await this.tableService.findByEvent(eventId);
  // }

  @UseGuards(AuthGuard('jwt'))
  async getTablesByEvent(@Param('eventId',ParseIntPipe) eventId:number,@Req() req): Promise<TableEvent[]>{
      const userId=req.user?.sub;
      if(!userId) throw new HttpException('utilisateur non authentifie',HttpStatus.UNAUTHORIZED);
      const table=await this.tableService.findByEvent(eventId);
      return table
  }


 


 /**
  * 
  * @param // Obtenir les tables liées au dernier  événement creer par l'útilisateur connecter
  * @returns 
  */

   @Get('/by-last-event')
  @UseGuards(AuthGuard('jwt'))
  async getTablesByLastEvent(@Req() req): Promise<TableEvent[]> {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException('Utilisateur non authentifié');

    const lastEvent = await this.evenementService.findLastEventByUserId(userId);
    if (!lastEvent) throw new NotFoundException("Aucun événement trouvé pour l'utilisateur");

    return this.tableService.findByEvent(lastEvent.id);
  }

  /**
   * 
   * @param id 
   * @param req 
   * @returns 
   * restApi pour la suppression de table
   */
//   @UseGuards(AuthGuard('jwt'))
//   @Post(':id/delete')
//   async deleteTable(@Param('id', ParseIntPipe) id: number, @Req() req): Promise<{ message: string }> {
//   const userId = req.user?.sub;
//   if (!userId) {
//     throw new UnauthorizedException('Utilisateur non authentifié');
//   }
//   return await this.tableService.DeleteTable(id, userId);
// }

}