import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PaypalService {
  private readonly clientId = process.env.PAYPAL_CLIENT_ID!;
  private readonly clientSecret = process.env.PAYPAL_CLIENT_SECRET!;
  private readonly apiUrl = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';

  /**
   * Récupère le token d'accès OAuth2
   */
  private async getAccessToken(): Promise<string> {
    const response = await axios.post(
      `${this.apiUrl}/v1/oauth2/token`,
      new URLSearchParams({ grant_type: 'client_credentials' }).toString(),
      {
        auth: {
          username: this.clientId,
          password: this.clientSecret,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    return response.data.access_token;
  }

  /**
   * Crée une souscription à partir du planId
   */
  async createSubscription(planId: string): Promise<string> {
    const token = await this.getAccessToken();

    const response = await axios.post(
      `${this.apiUrl}/v1/billing/subscriptions`,
      {
        plan_id: planId,
        application_context: {
          brand_name: 'MonApp Événements',
          user_action: 'SUBSCRIBE_NOW',
          return_url: 'http://localhost:3000/forfait/success',
          cancel_url: 'http://localhost:3000/forfait/cancel',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const approvalUrl = response.data.links.find((l: any) => l.rel === 'approve')?.href;
    if (!approvalUrl) {
      throw new Error(' URL d’approbation introuvable dans la réponse PayPal.');
    }

    return approvalUrl;
  }



  async getSubscriptionDetails(subscriptionId: string): Promise<any> {
  const token = await this.getAccessToken();

  const response = await axios.get(
    `${this.apiUrl}/v1/billing/subscriptions/${subscriptionId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );

  return response.data; // Contient `plan_id`, `subscriber`, etc.
}



}
