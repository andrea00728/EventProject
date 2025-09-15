// backend/src/modules/email/email.module.ts
import { Module } from '@nestjs/common';
import { EmailService } from '../../services/email/email.service';
import { EmailController } from '../../controllers/email/email.controller';

@Module({
  providers: [EmailService],
  controllers: [EmailController],
  exports: [EmailService], // <-- important pour l'injection dans d'autres modules
})
export class EmailModule {}
