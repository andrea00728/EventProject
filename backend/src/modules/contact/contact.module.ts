import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactMessage } from '../../entities/ContactMessage.entity';
import { ContactService } from '../../services/contact/contact-message.service';
import { ContactController } from '../../controllers/contact/contact-message.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ContactMessage])],
  controllers: [ContactController],
  providers: [ContactService],
})
export class ContactModule {}
