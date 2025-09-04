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
import { ContactMessage } from './entities/ContactMessage';
import { NotificationEntity } from './entities/notification.entity';
import { Admin } from './entities/Admin';

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
import { AdminModule } from './modules/admin/admin.module';
import { TasksModule } from './modules/tasks/tasks.module';

// Email
import { EmailModule } from './modules/email/email.module';

// Contrôleurs globaux
import { ProfileController } from './controllers/profile/profile.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env'] }),
    ScheduleModule.forRoot(),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
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
          Admin,
          ContactMessage,
        ],
        synchronize: true,
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
    ContactModule,
    AdminModule,
    TasksModule,
    EmailModule, // <-- notre nouveau module SendGrid
  ],
  controllers: [ProfileController],
  providers: [],
})
export class AppModule {}
