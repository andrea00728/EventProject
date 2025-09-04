import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/Authentication/entities/auth.entity';
import { Forfait } from 'src/entities/Forfait';
import { EmailService } from '../email/email.service'; // <-- SendGrid

@Injectable()
export class ForfaitCronService {
  private readonly logger = new Logger(ForfaitCronService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Forfait)
    private readonly forfaitRepository: Repository<Forfait>,

    private readonly emailService: EmailService, // <-- injection EmailService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async downgradeExpiredForfaits() {
    const now = new Date();
    const expiredUsers = await this.userRepository
      .createQueryBuilder('userAlias')
      .leftJoinAndSelect('userAlias.fofait', 'forfait')
      .where('forfait.expirationDate IS NOT NULL')
      .andWhere('forfait.expirationDate < :now', { now: now.toISOString() })
      .getMany();

    const freemium = await this.forfaitRepository.findOne({
      where: { nom: 'freemium' },
    });

    if (!freemium) {
      throw new Error(
        'Le forfait "freemium" est introuvable. Veuillez vous assurer qu’il existe dans la base de données.',
      );
    }

    for (const user of expiredUsers) {
      user.forfait = freemium;
      await this.userRepository.save(user);
      this.logger.warn(`Utilisateur ${user.email} rétrogradé en freemium`);

      await this.sendDowngradeEmail(user.email, user.name);
    }
  }

  async sendDowngradeEmail(email: string, name: string) {
    try {
      await this.emailService.sendEmail(
        email,
        'Votre forfait a expiré',
        `Bonjour ${name},\n\nVotre forfait a expiré et vous avez été rétrogradé au forfait freemium.\n\nMerci.`
      );
      this.logger.log(`📧 Email de rétrogradation envoyé à ${email}`);
    } catch (err) {
      this.logger.error(`Erreur envoi mail pour ${email}: ${err.message}`);
    }
  }
}
