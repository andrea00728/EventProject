import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileController } from './controllers/profile/profile.controller';
import { TableModule } from './modules/table/table.module';
import { InviteModule } from './modules/invite/invite.module';
import { InvitationModule } from './modules/invitation/invitation.module';
import { LocationModule } from './modules/localisation/localisation.module';
import { Evenement } from './entities/Evenement';
import { Localisation } from './entities/Location';
import { Invitation } from './entities/Invitation';
import { Invite } from './entities/Invite';
import { Salle } from './entities/salle';
import { TableEvent } from './entities/Table';
import { EvenementModule } from './modules/evenement/evenement.module';
import { AuthModule } from './Authentication/auth.module';
import { User } from './Authentication/entities/auth.entity';
import { GeminiModule } from './modules/gemini/gemini.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbHost = configService.get<string>('DB_HOST');
        const dbPort = parseInt(configService.get<string>('DB_PORT') || '5432', 10);
        const dbUsername = configService.get<string>('DB_USERNAME');
        const dbPassword = configService.get<string>('DB_PASSWORD');
        const dbDatabase = configService.get<string>('DB_DATABASE');

        console.log('DB_HOST:', dbHost);
        console.log('DB_PORT:', dbPort);
        console.log('DB_USERNAME:', dbUsername);
        console.log('DB_PASSWORD:', dbPassword);
        console.log('DB_DATABASE:', dbDatabase);

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
          entities: [User, Evenement, Localisation, Invitation, Invite, Salle, TableEvent],
          synchronize: true, // À désactiver en production
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    TableModule,
    InviteModule,
    InvitationModule,
    EvenementModule,
    LocationModule,
    GeminiModule,
  ],
  controllers: [ProfileController],
})
export class AppModule {}