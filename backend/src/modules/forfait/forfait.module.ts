import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/Authentication/entities/auth.entity';
import { Forfait } from 'src/entities/Forfait';
import { Evenement } from 'src/entities/Evenement';
import { ForfaitCronService } from 'src/services/forfait-cron/forfait-cron.service';
import { ForfaitService } from 'src/services/forfait/forfait.service';
import { PaypalModule } from '../paypal/paypal.module';
import { NotificationModule } from '../notification/notification.module';
import { EvenementModule } from '../evenement/evenement.module';
import { ForfaitController } from 'src/controllers/forfait/forfait.controller';
import { EmailModule } from '../email/email.module'; // <-- ajouté ici

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Forfait, Evenement]),
    PaypalModule,
    NotificationModule,
    forwardRef(() => EvenementModule),
    EmailModule, // <-- pour pouvoir injecter EmailService
  ],
  providers: [ForfaitCronService, ForfaitService],
  exports: [ForfaitCronService, ForfaitService],
  controllers: [ForfaitController],
})
export class ForfaitModule {}
