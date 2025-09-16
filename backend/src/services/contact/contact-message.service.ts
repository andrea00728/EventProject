import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactMessage } from '../../entities/ContactMessage';
import { NotificationGateway } from 'src/gateway/notification.gateway';
import * as nodemailer from 'nodemailer';
import path from 'path';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(ContactMessage)
    private readonly contactMessageRepository: Repository<ContactMessage>,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  // Créer un message reçu
  async create(contactData: Partial<ContactMessage>): Promise<ContactMessage> {
    const message = this.contactMessageRepository.create(contactData);
    this.notificationGateway.emitNotificationMessage({
      type: 'contactMessage',
      data: [message],
    });
    return await this.contactMessageRepository.save(message);
  }

  // Récupérer tous les messages ou filtrer par envoyés/reçus
  async findAll(isSent?: boolean): Promise<ContactMessage[]> {
    const query = this.contactMessageRepository.createQueryBuilder('message');
    if (isSent !== undefined) {
      query.where('message.isSent = :isSent', { isSent });
    }
    query.orderBy('message.createdAt', 'DESC');
    return await query.getMany();
  }

  // Supprimer un message
  async delete(id: number) {
    return await this.contactMessageRepository.delete(id);
  }

  // Mettre à jour le statut lu
  async updateReadStatus(
    id: number,
    isRead: boolean,
  ): Promise<ContactMessage> {
    const message = await this.contactMessageRepository.findOne({ where: { id } });
    if (!message) {
      throw new NotFoundException(`Message ${id} introuvable`);
    }
    message.isRead = isRead;
    return this.contactMessageRepository.save(message);
  }

  // Envoyer une réponse et sauvegarder **texte clair** dans la DB
  async sendResponseMessage(
  originalMessageId: number,
  responseContent: string, // texte que l'admin écrit
): Promise<ContactMessage> {
  const originalMessage = await this.contactMessageRepository.findOne({
    where: { id: originalMessageId },
  });
  if (!originalMessage) {
    throw new NotFoundException(`Message ${originalMessageId} introuvable`);
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

// console.log('Réponse reçue:', { originalMessageId, responseContent });


  // HTML pour l'email
  const logoPath = path.resolve('assets/images/logo_icone.gif');
  
      const mailOptions = {
        from: `"MasterTable Support" <${process.env.SMTP_USER}>`,
        to : originalMessage.email,
        subject: "Réponse à votre message - MasterTable",
        html: `
          <div style="font-family: Arial, sans-serif; line-height:1.6; max-width:600px; margin:auto; padding:20px; border:1px solid #e0e0e0; border-radius:8px;">
            <div style="text-align:center; margin-bottom:20px;">
              <img src="cid:logoMasterTable" alt="MasterTable Logo" style="max-width:150px;"/>
            </div>
            <h2 style="color:#4CAF50; text-align:center;">MasterTable</h2>
            <p>${responseContent.replace(/\n/g, "<br>")}</p>
          </div>
        `,
        attachments: [
          {
            filename: "logo.png",
            path: logoPath, 
            cid: "logoMasterTable",   // doit correspondre au src="cid:logoMasterTable"
          },
        ],
      };
  
      await transporter.sendMail(mailOptions);

  // TEXTE CLAIR pour la DB
  const plainTextMessage = responseContent;

  // Sauvegarde dans la DB : texte clair
  const emailRecord = this.contactMessageRepository.create({
    firstName: originalMessage.firstName,
    lastName: originalMessage.lastName || '',
    email: originalMessage.email,
    senderEmail: process.env.SMTP_USER,
    message: plainTextMessage, // <- ici le texte lisible
    isRead: true,
    isSent: true,
  });

  return await this.contactMessageRepository.save(emailRecord);
}

}