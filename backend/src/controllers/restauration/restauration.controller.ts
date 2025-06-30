import { Controller, Get, Post, Param, Body, ParseIntPipe, NotFoundException, Patch } from '@nestjs/common';
import { Categorie } from 'src/entities/categorie.entity';
import { Commande, CommandeStatus } from 'src/entities/commande.entity';
import { MenuItem } from 'src/entities/menu-item.entity';
import { RestaurationService } from 'src/services/restauration/restauration.service';

@Controller('restauration')
export class RestaurationController {
  constructor(private readonly service: RestaurationService) {}

  // Categories
  @Get('categories/:eventId')
  getCategories(@Param('eventId', ParseIntPipe) eventId: number): Categorie[] {
    return this.service.getCategories(eventId);
  }

  @Post('categories')
  createCategorie(@Body() categorie: Categorie) {
    this.service.createCategorie(categorie);
    return { message: 'Catégorie créée' };
  }

  // Menu Items
  @Get('menu/:eventId')
  getMenu(@Param('eventId', ParseIntPipe) eventId: number): MenuItem[] {
    return this.service.getMenuItems(eventId);
  }

  @Post('menu')
  createMenuItem(@Body() item: MenuItem) {
    this.service.createMenuItem(item);
    return { message: 'Menu item créé' };
  }

  // Commandes
  @Get('commandes/:eventId')
  getCommandes(@Param('eventId', ParseIntPipe) eventId: number): Commande[] {
    return this.service.getCommandes(eventId);
  }

  @Get('commande/:eventId/:id')
  getCommandeById(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Param('id', ParseIntPipe) id: number,
  ): Commande {
    return this.service.getCommandeById(eventId, id);
  }

  @Post('commande')
  createCommande(@Body() commande: Commande) {
    this.service.createCommande(commande);
    return { message: 'Commande créée' };
  }

  @Patch('commande/:eventId/:id/status')
  updateStatus(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body('statut') statut: CommandeStatus,
  ) {
    this.service.updateCommandeStatus(eventId, id, statut);
    return { message: 'Statut de commande mis à jour' };
  }
}
