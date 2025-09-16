import { Controller, Post, Body, Get, Delete, Param, Patch } from '@nestjs/common';
import { ContactService } from '../../services/contact/contact-message.service';
import { ContactMessage } from '../../entities/ContactMessage';

@Controller('contact_messages')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  // Créer un message reçu par un utilisateur
  @Post()
  async create(@Body() body: Partial<ContactMessage>): Promise<ContactMessage> {
    return await this.contactService.create(body);
  }

  // Récupérer tous les messages séparés par type (reçus / envoyés)
  @Get('all')
  async findAllSeparated(): Promise<{
    receivedMessages: ContactMessage[];
    sentEmails: ContactMessage[];
  }> {
    const receivedMessages = await this.contactService.findAll(false);
    const sentEmails = await this.contactService.findAll(true);
    return { receivedMessages, sentEmails };
  }

  // Supprimer un message
  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.contactService.delete(id);
  }

  // Mettre à jour le statut lu
  @Patch(':id')
  async updateReadStatus(
    @Param('id') id: number,
    @Body('isRead') isRead: boolean,
  ): Promise<ContactMessage> {
    return this.contactService.updateReadStatus(id, isRead);
  }

  // Envoyer une réponse à un message existant
  @Post('respond')
    async respondToMessage(
    @Body('originalMessageId') originalMessageId: number,
    @Body('responseContent') responseContent: string,
    ): Promise<ContactMessage> {
    console.log('API respond appelée:', { originalMessageId, responseContent }); // debug
    return await this.contactService.sendResponseMessage(originalMessageId, responseContent);
}

    @Get('/getAllMessagesForOneEmail')
    async findAllMessagesForOneEmail(@Body() email: string): Promise<ContactMessage[]> {
        return await this.contactService.getAllMessagesEmail(email);
    }

}
