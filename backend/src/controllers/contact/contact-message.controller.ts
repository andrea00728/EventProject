import { Controller, Post, Body, Get } from '@nestjs/common';
import { ContactService } from '../../services/contact/contact-message.service';
import { ContactMessage } from '../../entities/ContactMessage';

@Controller('contact')
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
}
