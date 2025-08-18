// backend/src/modules/invite.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from 'src/Authentication/entities/auth.entity';
import { GuestController } from 'src/controllers/invite-controller/invite-controller.controller';
import { PublicGuestController } from 'src/public-guest/public-guest.controller';

import { Evenement } from 'src/entities/Evenement';
import { Invite } from 'src/entities/Invite';
import { TableEvent } from 'src/entities/Table';

import { GuestService } from 'src/services/invite-service/invite-service.service';
import { PublicGuestService } from 'src/public-guest/public-guest.service';
import { TableService } from 'src/services/table-service/table-service.service';

import { QrCodeModule } from '../qrcode/qrcode.module';
import { ForfaitModule } from '../forfait/forfait.module';
import { NotificationModule } from '../notification/notification.module';
import { PersonnelModule } from '../personnel/personnel.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invite, TableEvent, Evenement, User]),
    ForfaitModule,
    NotificationModule,
    QrCodeModule,
    PersonnelModule,
  ],
  controllers: [GuestController, PublicGuestController],
  providers: [GuestService, PublicGuestService, TableService],
  exports: [GuestService],
})
export class InviteModule {}
