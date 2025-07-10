import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/Authentication/entities/auth.entity';
import { Forfait } from 'src/entities/Forfait';
import { PaypalWebhookService } from 'src/services/paypal-webhook/paypal-webhook.service';
import { PaypalService } from 'src/services/paypal/paypal.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Forfait]) // ⬅️ Nécessaire pour injecter les repositories
  ],
  providers: [PaypalService, PaypalWebhookService],
  exports: [PaypalService,PaypalWebhookService], // Pour l'utiliser ailleurs (comme dans ForfaitController)
})
export class PaypalModule {}