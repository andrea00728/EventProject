/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { AuthModule } from './modules/auth/auth.module';
// import { UsersModule } from './modules/users/users.module';
// import { User } from './entities/user.entity';
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
import { PaiementService } from './services/paiement/paiement.service';
import { PaiementController } from './controllers/paiement/paiement.controller';
import { PaiementModule } from './modules/paiement/paiement.module';
import { Place } from './entities/Place';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'], // Spécifie le fichier .env (optionnel, par défaut .env)
    }),
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
          entities: [User,Evenement,Localisation,Invitation,Invite,Salle,TableEvent,Place],
     
          synchronize: true,
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    // UsersModule,
    TableModule,
    InviteModule,
    InvitationModule,
    EvenementModule,
    LocationModule,
    PaiementModule,
   
  ],
  controllers: [ProfileController],
  providers: [],
})
export class AppModule {}