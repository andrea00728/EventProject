// src/invitation/invitation.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as QRCode from 'qrcode';
import * as nodemailer from 'nodemailer';
import { Invitation } from 'src/entities/Invitation';
import { CreateInvitationDto } from 'src/dto/CreateInvitatioDto';
import { GuestService } from '../invite-service/invite-service.service';

@Injectable()
export class InvitationService {
  constructor(
    @InjectRepository(Invitation)
    private readonly invitationRepository: Repository<Invitation>,
    private readonly guestService: GuestService,
  ) {}

  async createInvitation(dto: CreateInvitationDto): Promise<Invitation> {
    const invitation = this.invitationRepository.create(dto);
    await this.invitationRepository.save(invitation);
    await this.generateAndSendInvitations(dto.eventId, dto.templateType, dto.design);
    return invitation;
  }

  async generateAndSendInvitations(eventId: number, templateType: string, design: string): Promise<void> {
    const guests = await this.guestService.findByEvent(eventId);
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    for (const guest of guests) {
      const qrCode = await QRCode.toDataURL(
        JSON.stringify({
          guestId: guest.id,
          eventId,
          tableNumber: guest.table?.numero,
          nombre_place: guest.place,
        }),
      );

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: guest.email,
        subject: `Invitation to Event`,
        html: `
          <h1>Welcome, ${guest.nom} ${guest.prenom}!</h1>
          <p>You are invited to our event. Table: ${guest.table?.numero}, Seat: ${guest.place}</p>
          <img src="${qrCode}" alt="QR Code" />
        `,
      };

      await transporter.sendMail(mailOptions);
      guest.qrCode = qrCode;
      await this.guestService.update(guest.id, guest);
    }
  }
}