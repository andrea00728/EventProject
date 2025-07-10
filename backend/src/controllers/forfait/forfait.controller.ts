// import { BadRequestException, Body, Controller, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { User } from 'src/Authentication/entities/auth.entity';
// import { Forfait } from 'src/entities/Forfait';
// import { PaypalWebhookService } from 'src/services/paypal-webhook/paypal-webhook.service';
// import { PaypalService } from 'src/services/paypal/paypal.service';
// import { Repository } from 'typeorm';
// import { Request, Response } from 'express'; 
// import { AuthGuard } from '@nestjs/passport';
// import { Query } from 'typeorm/driver/Query';
// @Controller('forfait')
// export class ForfaitController {

//     constructor(
//         private readonly paypalService:PaypalService,
//         private readonly paypalWebhookService:PaypalWebhookService,
//         @InjectRepository(User)
//         private userRepository:Repository<User>,
//         @InjectRepository(Forfait)
//         private forfaitRepository:Repository<Forfait>,
//     ) {}

//    @Post('upgrade')
// @UseGuards(AuthGuard('jwt'))
// async upgrade(@Req() req, @Body() body: { forfaitNom: string }) {
//   const userId = req.user?.sub;
//   if (!userId) {
//     throw new UnauthorizedException('Utilisateur non authentifié');
//   }

//   const forfait = await this.forfaitRepository.findOne({
//     where: { nom: body.forfaitNom },
//   });
//   if (!forfait || !forfait.paypalplanid) {
//     throw new BadRequestException('Forfait PayPal invalide');
//   }
//   const approvalUrl = await this.paypalService.createSubscription(forfait.paypalplanid);
//   return { url: approvalUrl };
// }

//     @Post('webhook')
//     async handleWebhook(@Req() req:Request,@Res()   res:Response){
//         try{
//             await this.paypalWebhookService.processWebhook(req.body);
//             res.status(200).send('ok');
//         }catch(err){
//             console.log(err);
//             res.status(500).send('error');
//         }
//     }



//     @Get('success')
// async handleSuccess(@Query('subscription_id') subscriptionId: string, @Req() req: any) {
//   // Logique pour activer le forfait selon l'utilisateur
//   // Si tu stockes subscriptionId dans la base, tu peux lier avec userId
//   console.log('Abonnement PayPal validé :', subscriptionId);

//   // Exemple : mise à jour du forfait manuellement ici
//   const userId = req.user?.sub;
//   if (userId) {
//     const starter = await this.forfaitRepository.findOne({ where: { nom: 'starter' } });
//     if (starter) {
//       const user = await this.userRepository.findOne({ where: { id: userId } });
//       user.forfait = starter;
//       await this.userRepository.save(user);
//     }
//   }

//   return { message: '🎉 Forfait activé avec succès !' };
// }

// }



import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/Authentication/entities/auth.entity';
import { Forfait } from 'src/entities/Forfait';
import { PaypalWebhookService } from 'src/services/paypal-webhook/paypal-webhook.service';
import { PaypalService } from 'src/services/paypal/paypal.service';
import { Repository } from 'typeorm';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller('forfait')
export class ForfaitController {
  constructor(
    private readonly paypalService: PaypalService,
    private readonly paypalWebhookService: PaypalWebhookService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Forfait)
    private forfaitRepository: Repository<Forfait>,
  ) {}

  @Post('upgrade')
  @UseGuards(AuthGuard('jwt'))
  async upgrade(@Req() req, @Body() body: { forfaitNom: string }) {
    const userId = req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }

    const forfait = await this.forfaitRepository.findOne({
      where: { nom: body.forfaitNom },
    });

    if (!forfait || !forfait.paypalplanid) {
      throw new BadRequestException('Forfait PayPal invalide');
    }

    const approvalUrl = await this.paypalService.createSubscription(forfait.paypalplanid);
    return { url: approvalUrl };
  }

  @Post('webhook')
  async handleWebhook(@Req() req: Request, @Res() res: Response) {
    try {
      await this.paypalWebhookService.processWebhook(req.body);
      res.status(200).send('ok');
    } catch (err) {
      console.error(err);
      res.status(500).send('error');
    }
  }
 @Get('success')
@UseGuards(AuthGuard('jwt'))
async handleSuccess(
  @Query('subscription_id') subscriptionId: string,
  @Req() req: any,
) {
  const userId = req.user?.sub;
  if (!userId) {
    throw new UnauthorizedException('Utilisateur non authentifié');
  }

  if (!subscriptionId) {
    throw new BadRequestException('Subscription ID manquant');
  }
  const subscription = await this.paypalService.getSubscriptionDetails(subscriptionId);
  const planId = subscription.plan_id;

  if (!planId) {
    throw new BadRequestException('Impossible de récupérer plan_id depuis PayPal');
  }
  const forfait = await this.forfaitRepository.findOne({
    where: { paypalplanid: planId },
  });
  if (!forfait) {
    throw new BadRequestException(`Aucun forfait trouvé pour planId : ${planId}`);
  }
  const user = await this.userRepository.findOne({ where: { id: userId } });
  if (!user) {
    throw new BadRequestException('Utilisateur introuvable');
  }
  user.forfait = forfait;
  user.datedowngraded = null;
  await this.userRepository.save(user);
  return {
    message: `🎉 Paiement accepté, votre forfait ${forfait.nom} a été activé !`,
  };
}

  @Get('cancel')
  async handleCancel() {
    return {
      message: '❌ Paiement annulé. Aucune modification n’a été faite.',
    };
  }
}
