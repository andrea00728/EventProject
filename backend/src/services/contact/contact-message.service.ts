import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactMessage } from '../../entities/ContactMessage';
import { NotificationGateway } from 'src/gateway/notification.gateway';

@Injectable()
export class ContactService {
    constructor(
        @InjectRepository(ContactMessage)
        private readonly contactMessageRepository: Repository<ContactMessage>,
        private readonly notificationGateway: NotificationGateway, // Assuming you have a NotificationGateway for real-time notifications
    ) {}

    async create(contactData: Partial<ContactMessage>): Promise<ContactMessage> {
        const message = this.contactMessageRepository.create(contactData);
        this.notificationGateway.emitNotificationMessage({
            type: 'contactMessage',
            data: [message],
        });
        return await this.contactMessageRepository.save(message);
    }

    async findAll(): Promise<ContactMessage[]> {
        return await this.contactMessageRepository.find({
            order: { createdAt: 'DESC' }
        });
    }
}
