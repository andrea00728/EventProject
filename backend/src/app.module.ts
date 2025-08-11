import * as crypto from 'crypto';
(global as any).crypto = crypto;


  import { Module } from '@nestjs/common';
  import { ConfigModule, ConfigService } from '@nestjs/config';
  import { TypeOrmModule } from '@nestjs/typeorm';
  import { ScheduleModule } from '@nestjs/schedule';

  // Entités
  import { User } from './Authentication/entities/auth.entity';
  import { Evenement } from './entities/Evenement';
  import { Localisation } from './entities/Location';
  import { Invitation } from './entities/Invitation';
  import { Invite } from './entities/Invite';
  import { Salle } from './entities/salle';
  import { TableEvent } from './entities/Table';
  import { Place } from './entities/Place';
  import { Personnel } from './entities/Personnel';
  import { Menu } from './entities/menu.entity';
  import { MenuItem } from './entities/menu-item.entity';
  import { Order } from './entities/order.entity';
  import { OrderItem } from './entities/order-item.entity';
  import { Payment } from './entities/payment.entity';
  import { Balance } from './entities/balance.entity';
  import { Forfait } from './entities/Forfait';
  import { SystemPrompt } from './entities/system-prompt.entity';
  import { ShortLink } from './entities/ShortLink';
  import { Commentaire } from './entities/Commentaire';
  import { Satisfaction } from './entities/satisfaction.entity';
  import { Favorite } from './entities/Favorite';
  import { ContactMessage } from './entities/ContactMessage.entity';

  // Modules fonctionnels
  import { AuthModule } from './Authentication/auth.module';
  import { EvenementModule } from './modules/evenement/evenement.module';
  import { LocationModule } from './modules/localisation/localisation.module';
  import { ForfaitModule } from './modules/forfait/forfait.module';
  import { TableModule } from './modules/table/table.module';
  import { InviteModule } from './modules/invite/invite.module';
  import { InvitationModule } from './modules/invitation/invitation.module';
  import { PaiementModule } from './modules/paiement/paiement.module';
  import { PersonnelModule } from './modules/personnel/personnel.module';
  import { QrCodeModule } from './modules/qrcode/qrcode.module';
  import { MenuModule } from './modules/menu/menu.module';
  import { OrderModule } from './modules/order/order.module';
  import { SharedModule } from './modules/shared/shared.module';
  import { GeminiModule } from './modules/gemini/gemini.module';
  import { PaypalModule } from './modules/paypal/paypal.module';
  import { SystemPromptModule } from './modules/system-prompt/system-prompt.module';
  import { NotificationModule } from './modules/notification/notification.module';
  import { FavoriteModule } from './modules/favorite/favorite.module';
  import { ShortLinkModule } from './modules/short-link/short-link.module';
  import { CommentaireModule } from './modules/commentaire/commentaire.module';
  import { SatisfactionModule } from './modules/satisfaction/satisfaction.module';
  import { ContactModule } from './modules/contact/contact.module';

  // Contrôleurs globaux

  // Services globaux
  import { ForfaitService } from './services/forfait/forfait.service';
  import { ForfaitCronService } from './services/forfait-cron/forfait-cron.service';
  import { MailerModule } from '@nestjs-modules/mailer';
  import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
// Contrôleurs et services globaux
import { ProfileController } from './controllers/profile/profile.controller';
import { NotificationController } from './controllers/notification/notification.controller';
import { NotificationEntity } from './entities/notification.entity';
import { Admin } from './entities/Admin';
import { AdminModule } from './modules/admin/admin.module';

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
          throw new Error("Les variables d'environnement de la base de données sont manquantes");
        }

        return {
          type: 'postgres',
          host: dbHost,
          port: dbPort,
          username: dbUsername,
          password: dbPassword,
          database: dbDatabase,
          entities: [
            User,
            Evenement,
            Localisation,
            Invitation,
            Invite,
            Salle,
            TableEvent,
            Place,
            Personnel,
            Menu,
            MenuItem,
            Order,
            OrderItem,
            Payment,
            Balance,
            Forfait,
            SystemPrompt,
            ShortLink,
            Commentaire,
            Satisfaction,
            NotificationEntity,
            Favorite,
            Admin
          ],
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

      // Modules fonctionnels
      AuthModule,
      LocationModule,
      EvenementModule,
      ForfaitModule,
      NotificationModule,
      TableModule,
      InviteModule,
      InvitationModule,
      PaiementModule,
      PersonnelModule,
      QrCodeModule,
      MenuModule,
      OrderModule,
      SharedModule,
      GeminiModule,
      PaypalModule,
      SystemPromptModule,
      ShortLinkModule,
      CommentaireModule,
      SatisfactionModule,
      FavoriteModule,
      ContactModule, // <-- Ajouter le module Contact ici
      NotificationModule,
      AdminModule
    ],
    controllers: [ProfileController],
    providers: [],
  })
  export class AppModule {}
