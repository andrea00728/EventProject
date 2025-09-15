import { Injectable, BadRequestException, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  private readonly fromEmail: string;

  constructor() {
    const from = process.env.SENDGRID_FROM_EMAIL;
    if (!from) throw new Error('SENDGRID_FROM_EMAIL n’est pas défini dans le .env');
    this.fromEmail = from;

    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) throw new Error('SENDGRID_API_KEY n’est pas défini dans le .env');
    sgMail.setApiKey(apiKey);
  }

  async sendEmail(to: string, subject: string, message: string) {
    // Vérification simple du format email
    if (!to || !message) throw new BadRequestException('Destinataire et message requis.');
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(to)) throw new BadRequestException(`Email invalide: ${to}`);

    const msg = { to, from: this.fromEmail, subject: subject || 'Réponse à votre message', text: message, html: `<p>${message.replace(/\n/g, '<br>')}</p>` };

    try {
      console.log('Envoi email:', msg);
      await sgMail.send(msg);
      return { success: true, message: 'Email envoyé ✅' };
    } catch (err: any) {
      console.error('Erreur SendGrid:', err);

      // Si SendGrid renvoie Forbidden (403)
      if (err.code === 403) {
        throw new ForbiddenException('SendGrid interdit l’envoi de cet email (403). Vérifie ta clé API et l’adresse expéditeur.');
      }

      throw new InternalServerErrorException('Impossible d’envoyer l’email.');
    }
  }
}
