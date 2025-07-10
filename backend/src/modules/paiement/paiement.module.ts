// paiement.module.ts
import { Module } from '@nestjs/common';
import { PaiementService } from 'src/services/paiement/paiement.service';
import { PaiementController } from 'src/controllers/paiement/paiement.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Evenement } from 'src/entities/Evenement';


@Module({
  imports: [TypeOrmModule.forFeature([Evenement])],
  providers: [PaiementService],
  controllers: [PaiementController],
})
export class PaiementModule {}
