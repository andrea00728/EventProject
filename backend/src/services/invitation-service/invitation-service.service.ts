import { Injectable,HttpException, HttpStatus, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// import * as QRCode from 'qrcode';
import QRCode from 'qrcode';
// import * as PDFDocument from 'pdfkit';
import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';
import * as nodemailer from 'nodemailer';
import { Invitation } from 'src/entities/Invitation';
import { CreateInvitationDto } from 'src/dto/CreateInvitatioDto';
import { GuestService } from '../invite-service/invite-service.service';
import { PersonnelService } from '../personnel/personnel.service';

@Injectable()
export class InvitationService {
  constructor(
    @InjectRepository(Invitation)
    private readonly invitationRepository: Repository<Invitation>,
    private readonly guestService: GuestService,
    private readonly personnelService:PersonnelService,
  ) {}

  async createInvitation(dto: CreateInvitationDto): Promise<Invitation> {
    const invitation = this.invitationRepository.create({
      event: { id: dto.eventId },
    });

    await this.invitationRepository.save(invitation);
    await this.generateAndSendInvitations(dto.eventId);
    return invitation;
  }

  async generateAndSendInvitations(eventId: number): Promise<void> {
  const guests = await this.guestService.findByEvent(eventId);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  for (const guest of guests) {
  
    const qrCodeBuffer = await QRCode.toBuffer(
      JSON.stringify({
        guestId: guest.id,
        eventId,
        tableNumber: guest.table?.nom,
        nombre_place: guest.place,
      }),
    );

   
    const doc = new PDFDocument();
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      const buffers: Buffer[] = [];
      const dateDebut = new Date(guest.event?.date);
      const dateFin = new Date(guest.event?.date_fin);
      const formatter = new Intl.DateTimeFormat('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      doc.fontSize(16).text(`Bonjour ${guest.nom} ${guest.prenom},`);
      doc.moveDown();
      doc.fontSize(14).text(`Vous êtes invité à notre événement :${guest.event?.nom}`);
      doc.moveDown();
      doc.text(`Table : ${guest.table?.nom} | Place : ${guest.place}`);
      doc.moveDown();
     doc.fontSize(14).text(`le ${formatter.format(dateDebut)} jusque ${formatter.format(dateFin)}`);
      doc.moveDown();

      // Ajouter l’image du QR code
      doc.image(qrCodeBuffer, {
        fit: [200, 200],
        align: 'center',
        valign: 'center',
      });

      doc.end();
    });

    /**
     * envoye de l'invitation sous forme pdf via l'email
     */
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: guest.email,
      subject: `Invitation à l'événement`,
      html: `<p>Bonjour ${guest.nom}, veuillez trouver votre invitation en pièce jointe.</p>`,
      attachments: [
        {
          filename: `invitation-${guest.nom}.pdf`,
          content: pdfBuffer,
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    guest.qrCode = qrCodeBuffer.toString('base64');
    await this.guestService.update(guest.id, guest);
  }
}


/**
 * 
 * 
 * verification du code qr code pour le personnel accueil
 * 
 * 
 */

async VerificationQrcode(qrCode: string, userEmail: string): Promise<{ message: string }> {
  try {
    const decodedQrCode = JSON.parse(qrCode);
    const { guestId, eventId } = decodedQrCode;

    if (!guestId || !eventId) {
      throw new BadRequestException('QR code invalide');
    }

    const personnel = await this.personnelService.findOneByUserEmailAndEvent(userEmail, eventId);
    if (!personnel || personnel.role !== 'accueil') {
      throw new ForbiddenException('Vous n\'avez pas d\'accès pour cet événement');
    }

    const guest = await this.guestService.findOneByIdAndEvent(guestId, eventId);
    if (!guest) {
      throw new NotFoundException('Invitation introuvable');
    }

    if (guest.ckeckedIn) {
      throw new BadRequestException('Invitation déjà utilisée');
    }

    guest.ckeckedIn = true;
    await this.guestService.update(guest.id, guest);

    return { message: `Invitation confirmée pour ${guest.nom} ${guest.prenom}` };
  } catch (error) {
    throw error; 
  }
}





}
