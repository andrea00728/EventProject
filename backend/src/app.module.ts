// /* eslint-disable prettier/prettier */
// import { Module } from '@nestjs/common';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import { TypeOrmModule } from '@nestjs/typeorm';
// // import { AuthModule } from './modules/auth/auth.module';
// // import { UsersModule } from './modules/users/users.module';
// // import { User } from './entities/user.entity';
// import { ProfileController } from './controllers/profile/profile.controller';
// import { TableModule } from './modules/table/table.module';
// import { InviteModule } from './modules/invite/invite.module';
// import { InvitationModule } from './modules/invitation/invitation.module';
// import { LocationModule } from './modules/localisation/localisation.module';
// import { Evenement } from './entities/Evenement';
// import { Localisation } from './entities/Location';
// import { Invitation } from './entities/Invitation';
// import { Invite } from './entities/Invite';
// import { Salle } from './entities/salle';
// import { TableEvent } from './entities/Table';
// import { EvenementModule } from './modules/evenement/evenement.module';
// import { AuthModule } from './Authentication/auth.module';
// import { User } from './Authentication/entities/auth.entity';
// import { PaiementService } from './services/paiement/paiement.service';
// import { PaiementController } from './controllers/paiement/paiement.controller';
// import { PaiementModule } from './modules/paiement/paiement.module';
// import { Place } from './entities/Place';

// import { PersonnelController } from './controllers/personnel/personnel.controller';
// import { PersonnelModule } from './modules/personnel/personnel.module';
// import { Personnel } from './entities/Personnel';
// import { Forfait } from './entities/Forfait';
// import { ForfaitService } from './services/forfait/forfait.service';
// import { ScheduleModule } from '@nestjs/schedule';
// import { ForfaitCronService } from './services/forfait-cron/forfait-cron.service';
// import { ForfaitModule } from './modules/forfait/forfait.module';

// @Module({
//   imports: [
//     ConfigModule.forRoot({
//       isGlobal: true,
//       envFilePath: ['.env'], // Spécifie le fichier .env (optionnel, par défaut .env)
//     }),
   
//     TypeOrmModule.forRootAsync({
//       imports: [ConfigModule,ScheduleModule.forRoot()],
      
//       useFactory: (configService: ConfigService) => {
//         const dbHost = configService.get<string>('DB_HOST');
//         const dbPort = configService.get<number>('DB_PORT');
//         const dbUsername = configService.get<string>('DB_USERNAME');
//         const dbPassword = configService.get<string>('DB_PASSWORD');
//         const dbDatabase = configService.get<string>('DB_DATABASE');

//         if (!dbHost || !dbPort || !dbUsername || !dbPassword || !dbDatabase) {
//           throw new Error('Les variables d\'environnement de la base de données sont manquantes');
//         }

//         return {
//           type: 'postgres',
//           host: dbHost,
//           port: dbPort,
//           username: dbUsername,
//           password: dbPassword,
//           database: dbDatabase,
//           entities: [User,Evenement,Localisation,Invitation,Invite,Salle,TableEvent,Place,Personnel,Forfait],
     
//           synchronize: true,
//         };
//       },
//       inject: [ConfigService],
//     }),
//     AuthModule,
//     // UsersModule,
//     TableModule,
//     InviteModule,
//     InvitationModule,
//     EvenementModule,
//     LocationModule,
//     PaiementModule,
//     PersonnelModule,
//     ForfaitModule,
   
//   ],
//   controllers: [ProfileController],
//   providers: [ForfaitService, ForfaitCronService],
// })
// export class AppModule {}



/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ScheduleModule } from '@nestjs/schedule'; // Gardons ScheduleModule à sa place habituelle

// Importez toutes vos entités
import { Evenement } from './entities/Evenement';
import { Localisation } from './entities/Location';
import { Invitation } from './entities/Invitation';
import { Invite } from './entities/Invite';
import { Salle } from './entities/salle';
import { TableEvent } from './entities/Table';
import { Place } from './entities/Place';
import { Personnel } from './entities/Personnel';
import { Forfait } from './entities/Forfait';
import { User } from './Authentication/entities/auth.entity'; // Assurez-vous que c'est la bonne entité User

// Importez tous vos modules fonctionnels
import { AuthModule } from './Authentication/auth.module';
import { TableModule } from './modules/table/table.module';
import { InviteModule } from './modules/invite/invite.module';
import { InvitationModule } from './modules/invitation/invitation.module';
import { LocationModule } from './modules/localisation/localisation.module';
import { EvenementModule } from './modules/evenement/evenement.module';
import { PaiementModule } from './modules/paiement/paiement.module';
import { PersonnelModule } from './modules/personnel/personnel.module';
import { ForfaitModule } from './modules/forfait/forfait.module';
// Importez vos services et contrôleurs
import { ProfileController } from './controllers/profile/profile.controller';
import { ForfaitService } from './services/forfait/forfait.service';
import { ForfaitCronService } from './services/forfait-cron/forfait-cron.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
// Si vous avez un MailService dédié, il serait importé ici et ajouté aux providers ou dans un MailModule
// import { MailService } from './services/mail/mail.service';
import { PaypalService } from './services/paypal/paypal.service';
import { PaypalWebhookService } from './services/paypal-webhook/paypal-webhook.service';
import { PaypalModule } from './modules/paypal/paypal.module';


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
          entities: [User, Evenement, Localisation, Invitation, Invite, Salle, TableEvent, Place, Personnel, Forfait],
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
    ForfaitModule,
    PaypalModule,
  ],
  controllers: [ProfileController],
  providers: [],
})
export class AppModule {}