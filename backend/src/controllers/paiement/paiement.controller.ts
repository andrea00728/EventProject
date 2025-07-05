// paiement.controller.ts
import { Controller, Get, Query, Post, UseGuards, Req, HttpException, HttpStatus } from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { PaiementService } from 'src/services/paiement/paiement.service';

@Controller('paiement')
export class PaiementController {
  constructor(private readonly paiementService: PaiementService) {}

  // ➤ Générer un lien de paiement
  @Post('create')
  @UseGuards(AuthGuard('jwt'))
  async createPayment(@Req() req, @Query('eventId') eventId: number, @Query('amount') amount: number) {
    if (!eventId || !amount) {
      throw new HttpException('Paramètres manquants', HttpStatus.BAD_REQUEST);
    }
    return await this.paiementService.createPayment(eventId, amount);
  }

  // ➤ Retour de succès depuis frontend
  @Post('success')
  async confirmPayment(@Query('eventId') eventId: number, @Query('amount') amount: number) {
    return await this.paiementService.markEventAsPaid(eventId, amount);
  }
}
