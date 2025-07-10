// src/services/qrcode/qr-code.service.ts
import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';

@Injectable()
export class QrCodeService {
  async generateQrCode(url: string): Promise<string> {
    return QRCode.toDataURL(url); // Renvoie l'image encodée en base64
  }
}
