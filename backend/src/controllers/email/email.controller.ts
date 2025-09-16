import {
  Body,
  Controller,
  Post,
  BadRequestException,
} from '@nestjs/common';
import { EmailService } from '../../services/email/email.service';

@Controller('send-email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post()
  async send(
    @Body() body: { to: string; subject?: string; message: string },
  ) {
    if (!body?.to || !body?.message) {
      throw new BadRequestException(
        'Le destinataire et le message sont requis.',
      );
    }

    try {
      const response = await this.emailService.sendEmail(
        body.to,
        body.subject || 'Réponse à votre message',
        body.message,
      );
      return response;
    } catch (err) {
      console.error('❌ Erreur envoi email:', err);
      throw err;
    }
  }
}
