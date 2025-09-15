import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Evenement } from 'src/entities/Evenement';
import { Personnel } from 'src/entities/Personnel';
import { CreatePersonnelDto } from 'src/dto/PersonnelDto';
import { JwtService } from '@nestjs/jwt';
import * as nodemailer from 'nodemailer';
import { NotificationService } from '../notification/notification.service';
import { Admin } from 'src/entities/Admin';
import { Invite } from 'src/entities/Invite';
import { User } from 'src/Authentication/entities/auth.entity';
import { UpdatePersonnelDto } from 'src/dto/UpdatePersonnelDto';
@Injectable()
export class PersonnelService {
  constructor(
    @InjectRepository(Personnel)
    private personnelRepository: Repository<Personnel>,

    @InjectRepository(Evenement)
    private evenementRepository: Repository<Evenement>,

    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,

    @InjectRepository(User)
    private userRepository: Repository<User>,


    private jwtService:JwtService,
    private readonly notificationService:NotificationService,

    @InjectRepository(Invite)
    private inviteRepository: Repository<Invite>,
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

  async findAllPersonnels(): Promise<Personnel[]> {
    return this.personnelRepository.find({
      relations: ["evenement"], // si tu veux récupérer aussi les infos de l’événement
    });
  }

  async countAll(): Promise<number> {
    return this.personnelRepository.count();
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

  //verification Admin
  const isExistAdmin = await this.adminRepository.findOne({
    where :  {email : dto.email}
  })

  if (isExistAdmin) {
    throw new BadRequestException("c'est un email de l'administrateur")
  }


  // Vérification si l'utilisateur a déjà un rôle dans cet événement
  const existingPersonnel = await this.personnelRepository.findOne({
    where: {
      email: dto.email,
      evenement: { id: Number(dto.evenementId) },
    },
  });

  if (existingPersonnel) {
    throw new BadRequestException(`L'utilisateur ${dto.email} a deja un rôle dans cet événement.`);
  }

  // Vérification des chevauchements de dates avec d'autres événements
  const personnelEvents = await this.personnelRepository.find({
    where: {
      email: dto.email,
    },
    relations: ['evenement'],
  });

  const isDateConflict = personnelEvents.some((personnel) => {
    const otherEvent = personnel.evenement;
    // Vérifier si les dates de l'événement actuel chevauchent celles d'un autre événement
    return (
      evenement.date <= otherEvent.date_fin &&
      evenement.date_fin >= otherEvent.date
    );
  });
  if (isDateConflict) {
    throw new BadRequestException(`L'utilisateur ${dto.email} a déjà un rôle dans un autre événement à ces dates.`);
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

async findOneByUserEmail(email: string) {
  return this.personnelRepository.findOne({
    where: { email },
    relations: ['evenement', 'evenement.location', 'evenement.salle','evenement.user','evenement.tables' ],
  });
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

  /**
   * 
   * @returns 
   * utilise pour filtre a partire des historique les personnel disponnible
   */
  async findAvailablePersonnel(): Promise<Personnel[]> {
  return this.personnelRepository.find({
    where: { isActive: true },
  });
}

// trouver evenement par id de personnel
async findEventsByPersonnelId(personnelId: number): Promise<Evenement[]> {
    const personnel = await this.personnelRepository.findOne({
      where: { id: personnelId },
      relations: ['evenement'],
    });

    if (!personnel) {
      throw new NotFoundException('Personnel not found');
    }

    return [personnel.evenement];
  }


  // trouver invite par personnel
  async findInviteByPersonnelId(personnelId: number): Promise<Invite[]> {
    const personnel = await this.personnelRepository.findOne({
      where: { id: personnelId },
      relations: ['evenement'],
    });

    if (!personnel) {
      throw new NotFoundException('Personnel not found');
    }

    const invites = await this.inviteRepository.find({
      where: { event: { id: personnel.evenement.id } },
      relations: ['table']
    });

    return invites;
  }

  // trouver personnel dans evenement
  async findPersonnelByEventId (eventId: number): Promise<Personnel[]> {
    const personnel = await this.personnelRepository.find({
           where: {
        evenement: {
          id: eventId,
        },
      },

    });

    return personnel;
  }

  // personnel.service.ts
  async getEvenementByEmail(email: string): Promise<Evenement | null> {
    const personnel = await this.personnelRepository.findOne({
      where: { email },
      relations: ['evenement', 'evenement.location', 'evenement.salle', 'evenement.personnels','evenement.user','evenement.tables' ],
    });

    if (!personnel) return null;
    return personnel.evenement; // retourne l'événement lié
  }

  // personnel.service.ts
  // Dans UserService
  async findUserById(userId: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id: userId },
    });
  }


//mettre a jour le personnel
async updatePersonnel(id: number, dto: UpdatePersonnelDto): Promise<Personnel> {
  const personnel = await this.personnelRepository.findOne({
    where: { id },
    relations: ['evenement']
  });
  if (!personnel) {
    throw new NotFoundException('Personnel not found');
  }

  // Vérifier si l'email est modifié et s'il est déjà utilisé par un autre personnel dans le même événement
  if (dto.email && dto.email !== personnel.email) {
    const existingPersonnel = await this.personnelRepository.findOne({
      where: {
        email: dto.email,
        evenement: { id: personnel.evenement.id },
        id: Not(id), // Exclure le personnel actuel de la recherche
      },
    });
    if (existingPersonnel) {
      throw new BadRequestException(`L'email ${dto.email} est déjà utilisé par un autre personnel dans cet événement.`);
    }
  }

  // Mettre à jour les champs autorisés
  if (dto.nom !== undefined) {
    personnel.nom = dto.nom;
  }
  if (dto.email !== undefined) {
    personnel.email = dto.email;
  }
  if (dto.role !== undefined) {
    personnel.role = dto.role;
  }
  
  return this.personnelRepository.save(personnel);
}

// supprimer un personnel
async deletePersonnel(id: number): Promise<{ message: string }> {
  const personnel = await this.personnelRepository.findOne({ where: { id } });
  if (!personnel) {
    throw new NotFoundException('Personnel not found');
  }

  await this.personnelRepository.remove(personnel);
  return { message: 'Personnel supprimé avec succès' };
}

}
