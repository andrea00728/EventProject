import { Controller, Post, Body, Get, Delete, Param } from '@nestjs/common';
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

}
