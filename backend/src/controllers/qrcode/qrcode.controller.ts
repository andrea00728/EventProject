// src/controllers/qrcode/qr-code.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
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

  // Générer un QR code pour une table spécifique
  @Get('table/:eventId/:tableId')
  async generateQrCodeForTable(
    @Param('eventId') eventId: number,
    @Param('tableId') tableId: number,
  ) {
    const table = await this.tableRepository.findOne({
      where: { id: tableId, event: { id: eventId } },
    });
    if (!table) {
      throw new Error('Table ou événement non trouvé');
    }
    const qrCode = await this.qrCodeService.generateQrCodeForTable(eventId, tableId);
    return { url: `http://localhost:3000/menus/event/${eventId}/table/${tableId}`, qrCode };
  }

  // Générer des QR codes pour toutes les tables d’un événement
  @Get('menu/:eventId')
  async generateQrCodesForEvent(@Param('eventId') eventId: number) {
    const tables = await this.tableRepository.find({ where: { event: { id: eventId } } });
    const qrCodes = await Promise.all(
      tables.map(async (table) => {
        const qrCode = await this.qrCodeService.generateQrCodeForTable(eventId, table.id);
        return {
          tableId: table.id,
          tableNumber: table.numero,
          url: `http://localhost:3000/menus/event/${eventId}/table/${table.id}`,
          qrCode,
        };
      }),
    );
    return qrCodes;
  }
}