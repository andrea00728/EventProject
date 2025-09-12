// contact.controller.ts
import { Controller, Post, Body, Get, Delete, Param, Patch, BadRequestException } from '@nestjs/common';
import { ContactService } from '../../services/contact/contact-message.service';
import { ContactMessage } from '../../entities/ContactMessage';

@Controller('contact_messages')
export class ContactController {
    constructor(private readonly contactService: ContactService) {}

    @Post()
    async create(@Body() body: Partial<ContactMessage>): Promise<ContactMessage> {
        return await this.contactService.create(body);
    }

    @Get()
    async findAll(): Promise<ContactMessage[]> {
        return await this.contactService.findAll();
    }

    @Delete(':id')
    async remove(@Param('id') id: number) {
        return this.contactService.delete(id);
    }

    @Patch(':id')
    async updateReadStatus(
        @Param('id') id: number,
        @Body('isRead') isRead: boolean,
    ): Promise<ContactMessage> {
        return this.contactService.updateReadStatus(id, isRead);
    }

    // Nouveau endpoint pour envoyer une réponse par e-mail
    @Post('send-email')
    async sendEmail(
        @Body('to') to: string,
        @Body('name') name: string,
        @Body('message') message: string,
        @Body('subject') subject?: string,
    ): Promise<{ message: string }> {
        if (!to || !message) {
            throw new BadRequestException('Les champs "to" et "message" sont requis.');
        }
        await this.contactService.sendResponseMessage(to, name, message, subject);
        return { message: 'E-mail envoyé avec succès.' };
    }
}