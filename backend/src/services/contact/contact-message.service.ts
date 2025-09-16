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

    async sendResponseMessage(to: string, name: string, message: string) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
        },
    });

    const mailOptions = {
        from: `"MasterTable Support" <${process.env.SMTP_USER}>`,
        to: to,
        // replyTo: "support@mastertable.com", // si tu as une adresse officielle
        subject: `Réponse à votre message - MasterTable`,
        html: `
        <div style="font-family: Arial, sans-serif; color: #333; line-height:1.6; max-width:600px; margin:auto; padding:20px; border:1px solid #e0e0e0; border-radius:8px;">
            <h2 style="color:#4CAF50; text-align:center;">MasterTable</h2>
            <p>Bonjour <b>${name}</b>,</p>
            <p>${message}</p>
            <br>
            <p style="font-size:14px; color:#555;">Si vous avez d'autres questions, n'hésitez pas à nous contacter en répondant directement à cet e-mail.</p>
            <hr style="margin:20px 0; border:none; border-top:1px solid #ddd;">
            <p style="font-size:12px; color:#999; text-align:center;">
            Cet e-mail a été envoyé automatiquement par <b>MasterTable</b>.<br>
            Merci de ne pas y répondre directement.
            </p>
        </div>
        `,
    };

    await transporter.sendMail(mailOptions);
    }



}
