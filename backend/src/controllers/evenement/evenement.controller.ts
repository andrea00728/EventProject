// src/event/event.controller.ts
import { Controller, Post, Body, Get, Param, BadRequestException, UseGuards, Req, UnauthorizedException, Delete } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateEventDto } from 'src/dto/CreateEvenementDTO';
import { Evenement } from 'src/entities/Evenement';
import { EvenementService } from 'src/services/evenement/evenement.service';

@Controller('evenements')
export class EvenementController {
  constructor(private readonly evenementService: EvenementService) {}

  
    //creation d'evenement
   @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() dto: CreateEventDto, @Req() req: any): Promise<Evenement> {
    const userIdFromToken = req.user?.sub;
    if (!userIdFromToken) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }
    dto.utilisateur_id=userIdFromToken;
    return this.evenementService.create(dto);
  }
  /**
   * 
   * @param req 
   * @returns 
   * 
  //recuperation par compte connecte
   */

   @Get('/me')
  @UseGuards(AuthGuard('jwt'))
  async findUserEvenement(@Req() req: any): Promise<Evenement[]> {
    const userIdFromToken = req.user?.sub;
    if (!userIdFromToken) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }
    console.log('ID utilisateur récupéré du token:', userIdFromToken);
    return this.evenementService.findByUser(userIdFromToken);
  }

  @Get()
  findAll() {
    return this.evenementService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.evenementService.findOne(+id);
  }

  /**
   * Supprimer un événement
   * @param id L'ID de l'événement à supprimer
   */
  @Delete(':id/delete')
  @UseGuards(AuthGuard('jwt'))  
  async deleteEvent(@Param('id') id: number, @Req() req: any): Promise<{ message: string }> {
    const userIdFromToken = req.user?.sub;
    if (!userIdFromToken) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }
    return this.evenementService.deleteEvent(id, userIdFromToken);
  }
  /****************************** ******************** */
  @Get(':id/managerEvents')
  findManagerEvents(@Param('id') id: string) {
    return this.evenementService.findManagerEvents(id);   
  }
}


