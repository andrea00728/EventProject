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
import { Menu } from './entities/menu.entity';
import { MenuItem } from './entities/menu-item.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { EvenementModule } from './modules/evenement/evenement.module';
import { AuthModule } from './Authentication/auth.module';
import { User } from './Authentication/entities/auth.entity';
import { GeminiModule } from './modules/gemini/gemini.module';
import { QrCodeModule } from './modules/qrcode/qrcode.module';
import { MenuModule } from './modules/menu/menu.module';
import { OrderModule } from './modules/order/order.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: parseInt(configService.get<string>('DB_PORT') || '5432', 10),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [
          User,
          Evenement,
          Localisation,
          Invitation,
          Invite,
          Salle,
          TableEvent,
          Menu,
          MenuItem,
          Order,
          OrderItem,
        ],
        synchronize: true,
        logging: true,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    TableModule,
    InviteModule,
    InvitationModule,
    EvenementModule,
    LocationModule,
    GeminiModule,
    QrCodeModule,
    MenuModule,
    OrderModule,
  ],
  controllers: [ProfileController],
  providers: [],
})
export class AppModule {}