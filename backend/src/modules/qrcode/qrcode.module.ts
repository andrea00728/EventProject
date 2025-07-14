import { Module } from '@nestjs/common';
import { QrCodeService } from 'src/services/qrcode/qrcode.service';

@Module({
  providers: [QrCodeService],
  exports: [QrCodeService],
})
export class QrCodeModule {}
