// src/controllers/qrcode/qr-code.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { QrCodeService } from 'src/services/qrcode/qrcode.service';

@Controller('qrcode')
export class QrCodeController {
  constructor(private readonly qrCodeService: QrCodeService) {}

  @Get('menu/:eventId')
  async generateQrCodeForMenu(@Param('eventId') eventId: number) {
    const url = `http://localhost:3000/menus/event/${eventId}`;
    const qrCode = await this.qrCodeService.generateQrCode(url);
    return { url, qrCode };
  }
}
