// src/modules/qrcode/qrcode.module.ts
import { Module } from '@nestjs/common';
import { QrCodeService } from 'src/services/qrcode/qrcode.service';
import { QrCodeController } from 'src/controllers/qrcode/qrcode.controller';
import { TableEvent } from 'src/entities/Table';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShortLink } from 'src/entities/ShortLink';

@Module({
  imports:[TypeOrmModule.forFeature([TableEvent, ShortLink])],
  controllers: [QrCodeController],
  providers: [QrCodeService],
  exports: [QrCodeService],
})
export class QrCodeModule {}
