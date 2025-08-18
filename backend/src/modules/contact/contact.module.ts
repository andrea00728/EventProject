import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactMessage } from '../../entities/ContactMessage';
import { ContactService } from '../../services/contact/contact-message.service';
import { ContactController } from '../../controllers/contact/contact-message.controller';
import { NotificationGateway } from 'src/gateway/notification.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([ContactMessage])],
  controllers: [ContactController],
  providers: [ContactService, NotificationGateway],
  exports: [ContactService, NotificationGateway],
})
export class ContactModule {}
