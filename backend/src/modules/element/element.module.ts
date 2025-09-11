import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ElementController } from 'src/controllers/element/element.controller';
import { Element } from 'src/entities/Element';
import { Evenement } from 'src/entities/Evenement';
import { ElementService } from 'src/services/element.service';
import { NotificationService } from 'src/services/notification/notification.service';
import { NotificationModule } from '../notification/notification.module';
import { EvenementModule } from '../evenement/evenement.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Element, Evenement]),
    NotificationModule,
    EvenementModule,
],
  providers: [ElementService],
  controllers: [ElementController],
})
export class ElementModule {}