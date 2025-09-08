import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactMessage } from '../../entities/ContactMessage';
import { NotificationGateway } from 'src/gateway/notification.gateway';
import * as nodemailer from 'nodemailer';

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

    async delete(id: number) {
    return await this.contactMessageRepository.delete(id);
    }

    async updateReadStatus(id: number, isRead: boolean): Promise<ContactMessage> {
        const message = await this.contactMessageRepository.findOne({ where: { id } });
        if (!message) {
            throw new NotFoundException(`Message ${id} introuvable`);
        }
        message.isRead = isRead;
        return this.contactMessageRepository.save(message);
    }

    async sendResponseMessage(to : string, name : string, message : string){
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
        });
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: to,
            subject: `Réponse du message MasterTable`,
            html: `<p>Bonjour ${name}, ${message}.</p>`,
        };
    
        await transporter.sendMail(mailOptions);
    }


}
