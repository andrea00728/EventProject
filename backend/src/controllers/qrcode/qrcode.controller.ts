// src/controllers/qrcode/qr-code.controller.ts
import { Controller, Get, Param, NotFoundException, ParseIntPipe } from '@nestjs/common';
import { QrCodeService } from 'src/services/qrcode/qrcode.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TableEvent } from 'src/entities/Table';

@Controller('qrcode')
export class QrCodeController {
  constructor(
    private readonly qrCodeService: QrCodeService,
    @InjectRepository(TableEvent)
    private readonly tableRepository: Repository<TableEvent>,
  ) {}

  @Get('table/:eventId/:tableId')
  async generateQrCodeForTable(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Param('tableId', ParseIntPipe) tableId: number,
  ) {
    const table = await this.tableRepository.findOne({
      where: { id: tableId, event: { id: eventId } },
    });
    if (!table) {
      throw new NotFoundException('Table ou événement non trouvé');
    }

    const qrCode = await this.qrCodeService.generateQrCodeForTable(eventId, tableId);
    const shortUrl = qrCode.split('data:image/png;base64,')[0]; // Simplification, l'URL est dans le service
    return { url: shortUrl, qrCode };
  }

  @Get('menu/:eventId')
  async generateQrCodesForEvent(@Param('eventId', ParseIntPipe) eventId: number) {
    const tables = await this.tableRepository.find({ where: { event: { id: eventId } } });
    const qrCodes = await Promise.all(
      tables.map(async (table) => {
        const qrCode = await this.qrCodeService.generateQrCodeForTable(eventId, table.id);
        return {
          tableId: table.id,
          tableNumber: table.nom,
          url: qrCode.split('data:image/png;base64,')[0], // Simplification
          qrCode,
        };
      }),
    );
    return qrCodes;
  }
}