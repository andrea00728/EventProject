import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/Authentication/entities/auth.entity';
import { Forfait } from 'src/entities/Forfait';
import { Repository } from 'typeorm';

@Injectable()
export class PaypalWebhookService {
    constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Forfait)
    private forfaitRepo: Repository<Forfait>,
  ) {}

  async processWebhook(payload: any) {
    const eventType = payload.event_type;
    const resource = payload.resource;

    if (eventType === 'BILLING.SUBSCRIPTION.ACTIVATED') {
      const planId = resource.plan_id;
      const payerEmail = resource.subscriber?.email_address;

      const user = await this.userRepo.findOne({ where: { email: payerEmail } });
      const forfait = await this.forfaitRepo.findOne({ where: { paypalplanid: planId } });

      if (!user || !forfait) {
        throw new Error('Utilisateur ou forfait non trouvé');
      }

      const now = new Date();
      const expiration = new Date(now.getTime() + forfait.validationduration * 24 * 60 * 60 * 1000);

      user.forfait = forfait;
      user.datedowngraded = null;
      forfait.expirationdate = expiration;

      await this.userRepo.save(user);
      console.log(` Abonnement activé pour ${user.email}`);
    }

    // Tu peux aussi gérer d'autres cas ici
  }
}
