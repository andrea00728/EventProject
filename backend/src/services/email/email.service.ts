import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly transporter;
  private readonly fromEmail: string;

  constructor() {
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);

    if (!smtpUser || !smtpPass) {
      throw new Error('❌ SMTP_USER ou SMTP_PASS manquant dans le .env');
    }

    this.fromEmail = smtpUser;

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true pour SSL (465), false pour TLS (587)
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }

  async sendEmail(to: string, subject: string, message: string) {
    if (!to || !message) {
      throw new BadRequestException('Destinataire et message requis.');
    }

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(to)) {
      throw new BadRequestException(`Email invalide: ${to}`);
    }

    const mailOptions = {
      from: this.fromEmail,
      to,
      subject: subject || 'Réponse à votre message',
      text: message,
      html: `<p>${message.replace(/\n/g, '<br>')}</p>`,
    };

    try {
      console.log('📨 Envoi email via SMTP:', mailOptions);
      await this.transporter.sendMail(mailOptions);
      return { success: true, message: 'Email envoyé ✅' };
    } catch (err: any) {
      console.error('❌ Erreur SMTP:', err);

      if (err.code === 'EAUTH') {
        throw new ForbiddenException(
          'Authentification SMTP échouée. Vérifie SMTP_USER / SMTP_PASS.',
        );
      }

      throw new InternalServerErrorException('Impossible d’envoyer l’email.');
    }
  }
}
