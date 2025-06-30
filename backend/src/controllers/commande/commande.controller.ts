import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { CommandeService } from 'src/services/commande/commande.service';
import { CreateCommandeDto } from 'src/dto/create-commande.dto';
import { UpdateCommandeDto } from 'src/dto/update-commande.dto';

@Controller('commandes')  // <-- La route de base doit être 'commandes'
export class CommandeController {
  constructor(private readonly commandeService: CommandeService) {}

  @Post()
  createCommande(@Body() dto: CreateCommandeDto) {
    return this.commandeService.create(dto);
  }

  @Get()
  findAll() {
    return this.commandeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commandeService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCommandeDto) {
    return this.commandeService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commandeService.remove(+id);
  }
}
