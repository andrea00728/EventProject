


/* eslint-disable prettier/prettier */
import * as crypto from 'crypto'
(global as any).crypto = crypto
 
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ScheduleModule } from '@nestjs/schedule'; // Gardons ScheduleModule à sa place habituelle

import { Evenement } from './entities/Evenement';
import { Localisation } from './entities/Location';
import { Invitation } from './entities/Invitation';
import { Invite } from './entities/Invite';
import { Salle } from './entities/salle';
import { TableEvent } from './entities/Table';
import { EvenementModule } from './modules/evenement/evenement.module';
import { AuthModule } from './Authentication/auth.module';
import { User } from './Authentication/entities/auth.entity';
import { PaiementModule } from './modules/paiement/paiement.module';
import { Place } from './entities/Place';
import { PersonnelModule } from './modules/personnel/personnel.module';
import { Personnel } from './entities/Personnel';
import { QrCodeModule } from './modules/qrcode/qrcode.module';
import { MenuModule } from './modules/menu/menu.module';
import { OrderModule } from './modules/order/order.module';
import { Menu } from './entities/menu.entity';
import { MenuItem } from './entities/menu-item.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { SharedModule } from './modules/shared/shared.module';
import { Balance } from './entities/balance.entity';
import { Payment } from './entities/payment.entity';
import { GeminiModule } from './modules/gemini/gemini.module';
import { Forfait } from './entities/Forfait';

// Importez tous vos modules fonctionnels
import { TableModule } from './modules/table/table.module';
import { InviteModule } from './modules/invite/invite.module';
import { InvitationModule } from './modules/invitation/invitation.module';
import { LocationModule } from './modules/localisation/localisation.module';
import { ForfaitModule } from './modules/forfait/forfait.module';
// Importez vos services et contrôleurs
import { ProfileController } from './controllers/profile/profile.controller';
import { ForfaitService } from './services/forfait/forfait.service';
import { ForfaitCronService } from './services/forfait-cron/forfait-cron.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import { PaypalService } from './services/paypal/paypal.service';
import { PaypalWebhookService } from './services/paypal-webhook/paypal-webhook.service';
import { PaypalModule } from './modules/paypal/paypal.module';
import { SystemPrompt } from './entities/system-prompt.entity';
import { SystemPromptModule } from './modules/system-prompt/system-prompt.module';
import { ShortLinkController } from './controllers/short-link/short-link.controller';
import { ShortLink } from './entities/ShortLink';
import { NotificationService } from './services/notification/notification.service';
import { NotificationModule } from './modules/notification/notification.module';
import { ShortLinkModule } from './modules/short-link/short-link.module';
import { CommentaireModule } from './modules/commentaire/commentaire.module';
import { CommentaireService } from './services/commentaire/commentaire.service';
import { CommentaireController } from './controllers/commentaire/commentaire.controller';
import { Commentaire } from './entities/Commentaire';
import { SatisfactionService } from './services/satisfaction/satisfaction.service';
import { SatisfactionController } from './controllers/satisfaction/satisfaction.controller';
import { SatisfactionModule } from './modules/satisfaction/satisfaction.module';
import { Satisfaction } from './entities/satisfaction.entity';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),

   
    ScheduleModule.forRoot(),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], 
      useFactory: (configService: ConfigService) => {
        const dbHost = configService.get<string>('DB_HOST');
        const dbPort = configService.get<number>('DB_PORT');
        const dbUsername = configService.get<string>('DB_USERNAME');
        const dbPassword = configService.get<string>('DB_PASSWORD');
        const dbDatabase = configService.get<string>('DB_DATABASE');

        if (!dbHost || !dbPort || !dbUsername || !dbPassword || !dbDatabase) {
          throw new Error('Les variables d\'environnement de la base de données sont manquantes');
        }

        return {
          type: 'postgres',
          host: dbHost,
          port: dbPort,
          username: dbUsername,
          password: dbPassword,
          database: dbDatabase,
          entities: [User,Evenement,Localisation,Invitation,Invite,Salle,TableEvent,Place,Personnel, Menu, MenuItem, Order, OrderItem, Payment, Balance, Forfait, SystemPrompt, ShortLink, Commentaire, Satisfaction],
     
          synchronize: true, 
        };
      },
      inject: [ConfigService],
    }),

    MailerModule.forRootAsync({
      imports: [ConfigModule], 
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('SMTP_HOST'),
          port: configService.get<number>('SMTP_PORT'),
          secure: configService.get<number>('SMTP_PORT') === 465, 
          auth: {
            user: configService.get<string>('SMTP_USER'),
            pass: configService.get<string>('SMTP_PASS'),
          },
        },
        defaults: {
          from: `"${configService.get<string>('APP_NAME') || 'Mon Application'}" <${configService.get<string>('SMTP_USER')}>`,
        },
        template: {
          dir: process.cwd() + '/templates/', 
          adapter: new PugAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService], 
    }),
  

    AuthModule,
    TableModule,
    InviteModule,
    InvitationModule,
    EvenementModule,
    LocationModule,
    PaiementModule,
    PersonnelModule,
    QrCodeModule,
    MenuModule,
    OrderModule,
    SharedModule,
    GeminiModule,
    SystemPrompt,
    SystemPromptModule,
   
    ForfaitModule,
    PaypalModule,
    NotificationModule,
    ShortLinkModule,
    CommentaireModule,
    SatisfactionModule,

  ],
  controllers: [ProfileController,],
  providers: [],

})
export class AppModule {}