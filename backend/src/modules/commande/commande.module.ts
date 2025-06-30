import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Commande } from 'src/entities/commande.entity';
import { MenuItem } from 'src/entities/menu-item.entity';
import { CommandeService } from 'src/services/commande/commande.service';
import { CommandeController } from 'src/controllers/commande/commande.controller';
import { QrCodeModule } from 'src/modules/qrcode/qrcode.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Commande, MenuItem]),
    QrCodeModule,  // <-- Important pour pouvoir injecter QrCodeService
  ],
  providers: [CommandeService],
  controllers: [CommandeController],
  exports: [CommandeService],
})
export class CommandeModule {}
