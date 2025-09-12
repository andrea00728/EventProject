// contact-message.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
        private readonly notificationGateway: NotificationGateway,
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
            order: { createdAt: 'DESC' },
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

    async sendResponseMessage(to: string, name: string, message: string, subject?: string, attachment?: any): Promise<void> {
        // Validation des entrées
        if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
            throw new BadRequestException('Adresse e-mail invalide.');
        }
        if (!message) {
            throw new BadRequestException('Le message ne peut pas être vide.');
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const mailOptions: nodemailer.SendMailOptions = {
            from: process.env.SMTP_USER,
            to,
            subject: subject || 'Réponse du message MasterTable',
            html: `<p>Bonjour ${name},</p><p>${message}</p><p>Cordialement,<br>L'équipe MasterTable</p>`,
        };

        // Ajouter une pièce jointe si fournie
        if (attachment) {
            mailOptions.attachments = [
                {
                    filename: attachment.name,
                    content: attachment.data, // Buffer ou stream
                },
            ];
        }

        try {
            await transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Erreur lors de l\'envoi de l\'e-mail:', error);
            throw new BadRequestException('Échec de l\'envoi de l\'e-mail.');
        }
    }
}