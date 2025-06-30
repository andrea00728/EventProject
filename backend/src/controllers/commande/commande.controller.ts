import { Body, Controller, Get, NotFoundException, Param, ParseIntPipe, Post } from '@nestjs/common';
import { CreateCommandeDto } from 'src/dto/create-commande.dto';
import { CommandeService } from 'src/services/commande/commande.service';
import { QrCodeService } from 'src/services/qrcode/qrcode.service';

@Controller('commande')
export class CommandeController {
  constructor(
    private readonly qrCodeService: QrCodeService,
    private readonly commandeService: CommandeService,
  ) {}

  @Get(':id/qrcode')
  async getQrCode(@Param('id', ParseIntPipe) id: number) {
    const commande = await this.commandeService.findOne(id);

    if (!commande) {
      throw new NotFoundException(`Commande ${id} introuvable`);
    }

    const resume = commande.items
      .map(i => `${i.quantite} x ${i.nom} (${i.prix}€)`)
      .join(', ');

    const qrData = JSON.stringify({
      id: commande.id,
      tableId: commande.tableId,
      eventId: commande.eventId,
      total: commande.total,
      resume: resume,
    });
    

    const qrCode = await this.qrCodeService.generate(qrData);
    return { qrCode };
  }

  @Post()
  async createCommande(@Body() createCommandeDto: CreateCommandeDto) {
    return this.commandeService.create(createCommandeDto);
  }
}
