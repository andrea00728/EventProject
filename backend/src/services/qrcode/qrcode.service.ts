import * as QRCode from 'qrcode';
import { Injectable } from '@nestjs/common';

@Injectable()
export class QrCodeService {
  async generate(data: string): Promise<string> {
    return await QRCode.toDataURL(data);
  }
}
