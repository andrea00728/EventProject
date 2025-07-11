// src/modules/qrcode/qrcode.module.ts
import { Module } from '@nestjs/common';
import { QrCodeService } from 'src/services/qrcode/qrcode.service';
import { QrCodeController } from 'src/controllers/qrcode/qrcode.controller';
import { TableEvent } from 'src/entities/Table';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports:[TypeOrmModule.forFeature([TableEvent])],
  controllers: [QrCodeController],
  providers: [QrCodeService],
  exports: [QrCodeService],
})
export class QrCodeModule {}
