import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/Authentication/entities/auth.entity';
import { GuestController } from 'src/controllers/invite-controller/invite-controller.controller';
import { Evenement } from 'src/entities/Evenement';
import { Invite } from 'src/entities/Invite';
import { TableEvent } from 'src/entities/Table';
import { GuestService } from 'src/services/invite-service/invite-service.service';
import { TableService } from 'src/services/table-service/table-service.service';

@Module({
  imports: [TypeOrmModule.forFeature([Invite, TableEvent,Evenement,User])],
  providers: [GuestService, TableService],
  controllers: [GuestController],
  exports: [GuestService],
})
export class InviteModule {}
