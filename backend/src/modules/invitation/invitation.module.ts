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

@Module({
  imports: [TypeOrmModule.forFeature([Invitation, Invite, TableEvent,Evenement]),EvenementModule],
  providers: [InvitationService, GuestService, TableService, QrCodeService],
  controllers: [InvitationController],
})
export class InvitationModule {}
