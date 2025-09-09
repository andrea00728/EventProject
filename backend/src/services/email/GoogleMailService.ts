import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { google } from 'googleapis';
import nodemailer from 'nodemailer';

@Injectable()
export class GoogleMailService {
  private oAuth2Client;

  constructor() {
    this.oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL
    );
  }

  setCredentials(refreshToken: string) {
    this.oAuth2Client.setCredentials({ refresh_token: refreshToken });
  }

  async sendEmail(to: string, subject: string, message: string, refreshToken: string) {
    try {
      this.setCredentials(refreshToken);

      const accessToken = await this.oAuth2Client.getAccessToken();

      const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: process.env.ADMIN_EMAIL,
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          refreshToken,
          accessToken: accessToken.token,
        },
      });

      const mailOptions = {
        from: process.env.ADMIN_EMAIL,
        to,
        subject,
        text: message,
        html: `<p>${message.replace(/\n/g, '<br>')}</p>`,
      };

      const result = await transport.sendMail(mailOptions);
      return result;
    } catch (err) {
      console.error('Erreur envoi Gmail:', err);
      throw new InternalServerErrorException('Impossible d’envoyer l’email via Gmail.');
    }
  }
}
