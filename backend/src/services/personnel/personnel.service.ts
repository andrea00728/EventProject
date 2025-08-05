import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evenement } from 'src/entities/Evenement';
import { Personnel } from 'src/entities/Personnel';
import { CreatePersonnelDto } from 'src/dto/PersonnelDto';
import { JwtService } from '@nestjs/jwt';
import * as nodemailer from 'nodemailer';
import { NotificationService } from '../notification/notification.service';
@Injectable()
export class PersonnelService {
  constructor(
    @InjectRepository(Personnel)
    private personnelRepository: Repository<Personnel>,

    @InjectRepository(Evenement)
    private evenementRepository: Repository<Evenement>,

    private jwtService:JwtService,
    private readonly notificationService:NotificationService,
  ) {}

  private transporter=nodemailer.createTransport({
    service:'gmail',
    auth: {
      user: 'andrea112samuel@gmail.com',
      pass: 'cikytjyehygafpim',
    },
  });


  async findByEvenement(evenementId: number): Promise<Personnel[]> {
    return this.personnelRepository.find({
      where: {
        evenement: {
          id: evenementId,
        },
      },
      relations: ['evenement'],
    });
  }

  /************  Back pour l'affichage des personnels par event pour l'admin   *************** */

  async findAllPersonalForOneEvent(evenementId: number): Promise<Personnel[]> {
    return this.personnelRepository.find({
      where: {
        evenement: {
          id: evenementId,
        },
      }
    });
  }


  /**
   * confirmer le demande  pour etre un membre du personnel
   */
async confirmEmail(token: string): Promise<string> {
  try {
    const decoded = this.jwtService.verify(token);
    const { email, evenementId } = decoded;

   const personnel = await this.personnelRepository
      .createQueryBuilder('personnel')
      .innerJoin('personnel.evenement', 'evenement')
      .where('personnel.email = :email', { email })
      .andWhere('evenement.id = :evenementId', { evenementId })
      .andWhere('personnel.status = :status', { status: 'attent' })
      .getOne();

    if (!personnel) {
      throw new NotFoundException("Invitation introuvable ou déjà traitée.");
    }

    if (personnel.status !== 'attent') {
      throw new BadRequestException("Invitation déjà confirmée ou refusée.");
    }

    personnel.status = 'accepter';
    await this.personnelRepository.save(personnel);

    return "Confirmation réussie. Vous êtes maintenant membre du personnel.";
  } catch (err) {
    throw new BadRequestException("Lien invalide ou expiré.");
  }
}


/**
 * Refuses a personnel invitation for an event.
 *
 * This function decodes a JWT token to extract the user's email and event ID,
 * and attempts to find the corresponding personnel entry with a status of "attent"
 * (pending). If the personnel entry is found and its status is pending, the entry
 * is removed and a notification is sent. If the entry is not found or its status
 * is not pending, appropriate exceptions are thrown.
 *
 * @param token - A JWT token containing the user's email and event ID.
 * @returns A promise that resolves to a success message if the invitation is refused.
 * @throws NotFoundException if the invitation is not found or already processed.
 * @throws BadRequestException if the token is invalid or expired, or if the invitation
 *         is already confirmed or refused.
 */

async RefuseEmail(token: string): Promise<string> {
  try {
    const decoded = this.jwtService.verify(token);
    const { email, evenementId } = decoded;

   const personnel = await this.personnelRepository
      .createQueryBuilder('personnel')
      .innerJoin('personnel.evenement', 'evenement')
      .where('personnel.email = :email', { email })
      .andWhere('evenement.id = :evenementId', { evenementId })
      .andWhere('personnel.status = :status', { status: 'attent' })
      .getOne();

    if (!personnel) {
      throw new NotFoundException("Invitation introuvable ou déjà traitée.");
    }

    if (personnel.status !== 'attent') {
      throw new BadRequestException("Invitation déjà confirmée ou refusée.");
    }
    personnel.status = 'attent'; 
    const refu=await this.personnelRepository.remove(personnel);
     await this.notificationService.notifyAll(
      'invitation refusee',
      `l'email de l'utilisateur est ${personnel.email} refuse votre invitation de devenir ${personnel.role} de l'evenement ${personnel.evenement.nom}`,
    )
    return " Invitation refusée avec succès.";
  } catch (err) {
    throw new BadRequestException(" Lien invalide ou expiré.");
  }
}


/**
 * Creates a new personnel entry for the given event and user.
 * 
 * This function attempts to find the specified event by its ID and the
 * user ID. If the event is found, it creates a personnel entry with the
 * status "attent" (pending) and sends a notification to all users. 
 * It generates a JWT token for confirmation and refusal actions and
 * sends an email to the personnel's email address with links to confirm
 * or refuse the role.
 *
 * @param dto - Data transfer object containing personnel details.
 * @param userId - The ID of the user creating the personnel entry.
 * @returns A promise that resolves to the newly created Personnel object.
 * @throws BadRequestException if the event is not found for the user.
 */

async create(dto: CreatePersonnelDto, userId: string): Promise<Personnel> {
  const evenement = await this.evenementRepository.findOne({
    where: {
      id: Number(dto.evenementId),
      user: { id: userId },
    },
    relations: ['user'],
  });

  if (!evenement) {
    throw new BadRequestException("Événement non trouvé pour cet utilisateur.");
  }

  //  Création du personnel avec statut "pending"
  const personnel = this.personnelRepository.create({
    nom: dto.nom,
    email: dto.email,
    role: dto.role,
    evenement,
    status: 'attent', 
  });

  const savedPersonnel = await this.personnelRepository.save(personnel);
  await this.notificationService.notifyAll(
    'personnel créer avec success',
    `veuillez attendre leur confirmation de votre invitation de devenir ${savedPersonnel.role} de l'evenement ${evenement.nom}`,
  )
  //  Génération du token de confirmation
  const token = this.jwtService.sign(
    { email: savedPersonnel.email, evenementId: evenement.id ,status:'attent'},
    { expiresIn: '2d' }
  );

  const confirmationLink = `http://mastertable.site/personnel/response?token=${token}&action=confirm`;
  const refuseLink = `http://mastertable.site/personnel/response?token=${token}&action=refuse`;

  const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 465, 
  secure: true, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});


  await transporter.sendMail({
    to: savedPersonnel.email,
    subject: "Confirmation de votre rôle",
    html: `
      <p>Bonjour ${savedPersonnel.nom},</p>
      <p>Vous avez été invité comme <strong>${savedPersonnel.role}</strong> pour l'événement <b>${evenement.nom}</b>.</p>
    <p>
  <a href="${confirmationLink}" style="color: green; text-decoration: underline;"> Confirmer mon rôle</a><br/>
  <a href="${refuseLink}" style="color: red; text-decoration: underline;"> Refuser l’invitation</a>
  </p>
    `,
  });

  return savedPersonnel;
}

/**
 * Finds a personnel entry by user email and event ID.
 *
 * This function searches the personnel repository for a record
 * that matches the given email and event ID, returning the
 * corresponding Personnel object if found.
 *
 * @param email - The email of the personnel to find.
 * @param eventId - The ID of the event associated with the personnel.
 * @returns A promise that resolves to the Personnel object if found,
 *          or null if no matching record is found.
 */

async findOneByUserEmailAndEvent(email: string, eventId: number): Promise<Personnel | null> {
  return await this.personnelRepository.findOne({
    where: {
      email: email,
      evenement: { id: eventId },
    },
    relations: ['evenement'],
  });
}


/**
 * 
 * utilise pour  verifierr autrise
 * 
 * 
 */

  /**
   * Finds a personnel entry by user email.
   *
   * This function searches the personnel repository for a record
   * that matches the given email, returning the corresponding
   * Personnel object if found.
   *
   * @param email - The email of the personnel to find.
   * @returns A promise that resolves to the Personnel object if found,
   *          or null if no matching record is found.
   */
async findOneByUserEmail(email: string): Promise<Personnel | null> {
  return await this.personnelRepository.findOne({
    where: {
      email: email,
    },
    relations: ['evenement'],
  });
}

  /**
   * Finds the count of personnel entries associated with the given event ID.
   *
   * @param evenementId - The ID of the event for which to count personnel.
   * @returns A promise that resolves to the count of personnel entries for the given event.
   */
async findCountPersonnelByEvenement(evenementId: number): Promise<number> {
    const count = await this.personnelRepository.count({
      where: {
        evenement: {
          id: evenementId,
        },
      },
    });
    return count;
  }



}
