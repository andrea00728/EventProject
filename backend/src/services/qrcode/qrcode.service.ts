<<<<<<< HEAD
// src/services/qrcode/qr-code.service.ts
import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';

@Injectable()
export class QrCodeService {
  async generateQrCode(url: string): Promise<string> {
    return QRCode.toDataURL(url); // Renvoie l'image encodée en base64
=======
import * as QRCode from 'qrcode';
import { Injectable } from '@nestjs/common';

@Injectable()
export class QrCodeService {
  async generate(data: string): Promise<string> {
    return await QRCode.toDataURL(data);
>>>>>>> 0ef7910015ba8bcaffd4a3e5719f6f870aba665c
  }
}
