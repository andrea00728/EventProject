import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/Authentication/entities/auth.entity';
import { Forfait } from 'src/entities/Forfait';
import { ForfaitCronService } from 'src/services/forfait-cron/forfait-cron.service';
import { ForfaitService } from 'src/services/forfait/forfait.service';
import { PaypalWebhookService } from 'src/services/paypal-webhook/paypal-webhook.service';
import { PaypalService } from 'src/services/paypal/paypal.service';
import { PaypalModule } from '../paypal/paypal.module';
import { ForfaitController } from 'src/controllers/forfait/forfait.controller';
import { Evenement } from 'src/entities/Evenement';

@Module({
    imports:[TypeOrmModule.forFeature([User,Forfait,Evenement]),
    PaypalModule,
],
    providers:[ForfaitCronService,ForfaitService],
    exports:[ForfaitCronService,ForfaitService] ,
    controllers:[ForfaitController,]
})
export class ForfaitModule {}

