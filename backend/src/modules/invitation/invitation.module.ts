import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvitationController } from 'src/controllers/invitation-controller/invitation-controller.controller';
import { Evenement } from 'src/entities/Evenement';
import { Invitation } from 'src/entities/Invitation';
import { Invite } from 'src/entities/Invite';
import { TableEvent } from 'src/entities/Table';
import { InvitationService } from 'src/services/invitation-service/invitation-service.service';
import { GuestService } from 'src/services/invite-service/invite-service.service';
import { TableService } from 'src/services/table-service/table-service.service';
import { EvenementModule } from '../evenement/evenement.module';
import { QrCodeService } from 'src/services/qrcode/qrcode.service';
import { ShortLink } from 'src/entities/ShortLink';
import { InviteModule } from '../invite/invite.module';
import { User } from 'src/Authentication/entities/auth.entity';
import { NotificationModule } from '../notification/notification.module';
import { PersonnelModule } from '../personnel/personnel.module';

@Module({
  imports: [TypeOrmModule.forFeature([Invitation, Invite, TableEvent,Evenement, ShortLink, User]),EvenementModule,InviteModule,NotificationModule,PersonnelModule],
  providers: [InvitationService, TableService,GuestService, QrCodeService],
  controllers: [InvitationController],
})
export class InvitationModule {}
