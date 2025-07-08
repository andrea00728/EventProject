import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evenement } from 'src/entities/Evenement';
import { Personnel } from 'src/entities/Personnel';
import { CreatePersonnelDto } from 'src/dto/PersonnelDto';
import { JwtService } from '@nestjs/jwt';
import * as nodemailer from 'nodemailer';
@Injectable()
export class PersonnelService {
  constructor(
    @InjectRepository(Personnel)
    private personnelRepository: Repository<Personnel>,

    @InjectRepository(Evenement)
    private evenementRepository: Repository<Evenement>,

    private jwtService:JwtService,
  ) {}

  private transporter=nodemailer.createTransport({
    service:'gmail',
    auth: {
      user: 'andrea112samuel@gmail.com',
      pass: 'cikytjyehygafpim',
    },
  });

  // async create(dto: CreatePersonnelDto, userId: string): Promise<Personnel> {
  //   const evenement = await this.evenementRepository.findOne({
  //     where: {
  //       id: Number(dto.evenementId),
  //       user: {
  //         id: userId,
  //       },
  //     },
  //     relations: ['user'],
  //   });

  //   if (!evenement) {
  //     throw new BadRequestException("Événement non trouvé pour cet utilisateur.");
  //   }

  //   const personnel = this.personnelRepository.create({
  //     nom: dto.nom,
  //     email: dto.email,
  //     role: dto.role,
  //     evenement,
  //   });

  //   return this.personnelRepository.save(personnel);
  // }

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
    personnel.status = 'attent'; // Vous pouvez changer le statut à 'accepter' ou un autre statut selon votre logique
    await this.personnelRepository.save(personnel);

    return " Invitation refusée avec succès.";
  } catch (err) {
    throw new BadRequestException(" Lien invalide ou expiré.");
  }
}


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

  //  Génération du token de confirmation
  const token = this.jwtService.sign(
    { email: savedPersonnel.email, evenementId: evenement.id ,status:'attent'},
    { expiresIn: '2d' }
  );

  const confirmationLink = `http://localhost:5173/personnel/response?token=${token}&action=confirm`;
  const refuseLink = `http://localhost:5173/personnel/response?token=${token}&action=refuse`;

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
