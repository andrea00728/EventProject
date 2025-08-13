import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactMessage } from '../../entities/ContactMessage';

@Injectable()
export class ContactService {
    constructor(
        @InjectRepository(ContactMessage)
        private readonly contactMessageRepository: Repository<ContactMessage>,
    ) {}

    async create(contactData: Partial<ContactMessage>): Promise<ContactMessage> {
        const message = this.contactMessageRepository.create(contactData);
        return await this.contactMessageRepository.save(message);
    }

    async findAll(): Promise<ContactMessage[]> {
        return await this.contactMessageRepository.find({
            order: { createdAt: 'DESC' }
        });
    }
}
