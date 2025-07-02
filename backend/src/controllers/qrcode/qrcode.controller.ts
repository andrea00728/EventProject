import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { QrCodeService } from '../../services/qrcode/qrcode.service';

@Controller('qrcode')
export class QrCodeController {
  constructor(private readonly qrCodeService: QrCodeService) {}

  @Get('table/:tableId')
  async generateQrCodeForTable(@Param('tableId') tableId: number) {
    return this.qrCodeService.generateQrCodeForTable(tableId);
  }
}