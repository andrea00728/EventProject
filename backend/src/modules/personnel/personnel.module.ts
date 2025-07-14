import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Personnel } from 'src/entities/Personnel';
import { Evenement } from 'src/entities/Evenement';


import { PersonnelService } from 'src/services/personnel/personnel.service';
import { PersonnelController } from 'src/controllers/personnel/personnel.controller';
import { User } from 'src/Authentication/entities/auth.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Personnel, Evenement, User]), 
  ],
  providers: [PersonnelService],
  controllers: [PersonnelController],
  exports: [PersonnelService],  
})
export class PersonnelModule {}
