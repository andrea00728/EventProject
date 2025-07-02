import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TableEvent } from '../../entities/Table';
import { QrCodeService } from '../../services/qrcode/qrcode.service';
import { QrCodeController } from '../../controllers/qrcode/qrcode.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TableEvent])],
  providers: [QrCodeService],
  controllers: [QrCodeController],
})
export class QrCodeModule {}