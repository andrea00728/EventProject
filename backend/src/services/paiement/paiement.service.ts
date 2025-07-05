// paiement.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Evenement } from 'src/entities/Evenement';
import { Repository } from 'typeorm';

@Injectable()
export class PaiementService {
  private PAYPAL_API = process.env.PAYPAL_API_URL ?? '';
  private CLIENT_ID = process.env.PAYPAL_CLIENT_ID ?? '';
  private CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET ?? '';

  constructor(
    @InjectRepository(Evenement)
    private readonly eventRepo: Repository<Evenement>,
  ) {}

  private async getAccessToken(): Promise<string> {
    const response = await axios.post(
      `${this.PAYPAL_API}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        auth: {
          username: this.CLIENT_ID,
          password: this.CLIENT_SECRET,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );
    return response.data.access_token;
  }

  async createPayment(eventId: number, montant: number): Promise<string> {
    const event = await this.eventRepo.findOne({ where: { id: eventId } });
    if (!event) throw new BadRequestException("Événement introuvable");

    const accessToken = await this.getAccessToken();
    const montantNumber = typeof montant === "string" ? parseFloat(montant) : montant;
    const response = await axios.post(
      `${this.PAYPAL_API}/v2/checkout/orders`,
      {
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: String(eventId),
            amount: {
              currency_code: 'EUR',
              value: montantNumber.toFixed(2),
            },
          },
        ],
        application_context: {
          brand_name: 'Gestion Événement',
          return_url: `${process.env.FRONTEND_URL}/evenement/tables/affichageTable?eventId=${eventId}&amount=${montant}`,
          cancel_url: `${process.env.FRONTEND_URL}/paypal-cancel`,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const approvalUrl = response.data.links.find((l) => l.rel === 'approve')?.href;
    return approvalUrl;
  }

  async markEventAsPaid(eventId: number, montant: number) {
    const event = await this.eventRepo.findOne({ where: { id: eventId } });
    if (!event) throw new BadRequestException("Événement introuvable");

    event.montanttransaction = montant;
    await this.eventRepo.save(event);
    return { message: 'Paiement confirmé, événement mis à jour.' };
  }
}
