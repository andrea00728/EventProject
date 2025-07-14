import { Controller, Post, Put, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaiementService } from 'src/services/paiement/paiement.service';


@Controller('paiement')
export class PaiementController {
  constructor(private readonly paiementService: PaiementService) {}

 @Post('create')
@UseGuards(AuthGuard('jwt'))
async createPayment(@Query('eventId') eventId: number, @Query('amount') amount: string) {
  return this.paiementService.createPayment(eventId, Number(amount)); // Convertir en nombre
}

  @Post('success')
  @UseGuards(AuthGuard('jwt'))
  async confirmPaypalSuccess(@Query('eventId') eventId: number, @Query('amount') amount: number) {
    return this.paiementService.confirmPaypalSuccess(eventId, amount);
  }

  @Put('update')
  @UseGuards(AuthGuard('jwt'))
  async updatePaypalPayment(@Query('eventId') eventId: number, @Query('amount') amount: number) {
    return this.paiementService.updatePaypalPayment(eventId, amount);
  }

  @Get('details')
  @UseGuards(AuthGuard('jwt'))
  async getPaymentDetails(@Query('eventId') eventId: number) {
    return this.paiementService.getPaymentDetails(eventId);
  }
}