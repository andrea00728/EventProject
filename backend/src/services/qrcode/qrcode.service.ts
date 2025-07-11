// src/services/qrcode/qr-code.service.ts
import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';

@Injectable()
export class QrCodeService {
  async generateQrCodeForTable(eventId: number, tableId: number): Promise<string> {
    const url = `http://localhost:3000/menus/event/${eventId}/table/${tableId}`;
    return QRCode.toDataURL(url); // Renvoie l'image encodée en base64
  }
}