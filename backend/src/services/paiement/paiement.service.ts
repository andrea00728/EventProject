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
        auth: { username: this.CLIENT_ID, password: this.CLIENT_SECRET },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      },
    );
    return response.data.access_token;
  }

  async createPayment(eventId: number, montant: number): Promise<string> {
    // Valider et convertir le montant
    if (montant == null || isNaN(montant)) {
      throw new BadRequestException('Le montant fourni est invalide ou manquant.');
    }
    const validatedMontant = Number(montant);
    if (isNaN(validatedMontant)) {
      throw new BadRequestException('Impossible de convertir le montant en nombre.');
    }

    const event = await this.eventRepo.findOne({ where: { id: eventId } });
    if (!event) throw new BadRequestException("Événement introuvable");

    const accessToken = await this.getAccessToken();
    try {
      const response = await axios.post(
        `${this.PAYPAL_API}/v2/checkout/orders`,
        {
          intent: 'CAPTURE',
          purchase_units: [
            {
              reference_id: String(eventId),
              amount: { currency_code: 'EUR', value: validatedMontant.toFixed(2) },
            },
          ],
          application_context: {
            brand_name: 'Gestion Événement',
            return_url: `${process.env.FRONTEND_URL}/paypal-success?eventId=${eventId}&amount=${validatedMontant}`,
            cancel_url: `${process.env.FRONTEND_URL}/paypal-cancel`,
          },
        },
        { headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' } },
      );
      const approvalUrl = response.data.links.find((l) => l.rel === 'approve')?.href;
      if (!approvalUrl) throw new Error("Aucune URL d'approbation trouvée dans la réponse PayPal.");
      return approvalUrl;
    } catch (err) {
      console.error("Erreur PayPal :", err.response?.data || err.message);
      throw new Error(`Échec de la création du paiement : ${err.response?.data?.message || err.message}`);
    }
  }

  async confirmPaypalSuccess(eventId: number, amount: number) {
    return this.markEventAsPaid(eventId, amount);
  }

  async markEventAsPaid(eventId: number, montant: number) {
    const event = await this.eventRepo.findOne({ where: { id: eventId } });
    if (!event) throw new BadRequestException("Événement introuvable");

    event.montanttransaction = montant;
    await this.eventRepo.save(event);
    return { message: 'Paiement confirmé, événement mis à jour.' };
  }

  async updatePaypalPayment(eventId: number, newAmount: number) {
    const event = await this.eventRepo.findOne({ where: { id: eventId } });
    if (!event) throw new BadRequestException("Événement introuvable");

    event.montanttransaction = newAmount;
    await this.eventRepo.save(event);

    const accessToken = await this.getAccessToken();
    const response = await axios.patch(
      `${this.PAYPAL_API}/v2/checkout/orders/${eventId}`, // Endpoint à vérifier
      {
        purchase_units: [{ amount: { value: newAmount.toFixed(2) } }],
      },
      { headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' } },
    );

    return { message: 'Paiement mis à jour avec succès', data: response.data };
  }

  async getPaymentDetails(eventId: number) {
    const event = await this.eventRepo.findOne({ where: { id: eventId } });
    if (!event) throw new BadRequestException("Événement introuvable");

    return { eventId, montanttransaction: event.montanttransaction || 0 };
  }
}