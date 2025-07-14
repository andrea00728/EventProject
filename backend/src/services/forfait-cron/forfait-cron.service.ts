import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/Authentication/entities/auth.entity';
import { Forfait } from 'src/entities/Forfait';
import { Repository } from 'typeorm';

@Injectable()
export class ForfaitCronService {

    private readonly logger =new Logger(ForfaitCronService.name);
    constructor(
        @InjectRepository(User)
        private readonly  userRepository:Repository<User>,

        @InjectRepository(Forfait)
        private readonly forfaitRepository:Repository<Forfait>,
        private readonly mailerService:MailerService,
    ) {}

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)

    async downgradeExpiredForfaits(){
        const now= new Date();
        const expiredUsers=await this.userRepository.createQueryBuilder('userAlias')
        .leftJoinAndSelect('userAlias.fofait','forfait')
        .where('forfait.expirationDate IS NOT NULL')
        .andWhere('forfait.expirationDate<:now',{now:now.toISOString()})
        .getMany();

        const freemium=await this.forfaitRepository.findOne({where:{nom:'freemium'}});
        if(!freemium){
            throw new Error('l forfait ""freemium"  est introuvable veuille assure leur existance dans la base de donnees')
        }
    for(const user of expiredUsers){
        user.forfait=freemium;
        await this.userRepository.save(user);
        this.logger.warn(`Utilisateur ${user.email} retrograde en freemium`);
        await this.sendDowngradeEmail(user.email,user.name);
    }
    }


   async sendDowngradeEmail(email: string, name: string) {
  try {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Votre forfait a expiré',
      template: './downgrade-notice', 
      context: {
        name,
      },
    });
    this.logger.log(`📧 Email de rétrogradation envoyé à ${email}`);
  } catch (err) {
    this.logger.error(`Erreur envoi mail pour ${email}: ${err.message}`);
  }
}
}
