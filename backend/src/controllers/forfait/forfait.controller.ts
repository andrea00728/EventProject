import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
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
import { addDays } from 'date-fns';
import { NotificationService } from 'src/services/notification/notification.service';
import { ForfaitService } from 'src/services/forfait/forfait.service';
import { CreateForfaitDto } from 'src/dto/create-forfait.dto';
import { UpdateForfaitDto } from 'src/dto/update-forfait.dto';


// Interface pour les données de création/modification de forfait

@Controller('forfait')
export class ForfaitController {
  constructor(
    private readonly paypalService: PaypalService,
    private readonly paypalWebhookService: PaypalWebhookService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Forfait)
    private forfaitRepository: Repository<Forfait>,
    private readonly notificationService: NotificationService,
    private readonly forfaitService: ForfaitService,
  ) { }

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

  /**
   * 
   * @param subscriptionId 
   * 
   * 
   * 
   * @param res 
   * @returns 
   */
 @Get('success')
async redirectToFrontend(
  @Query('subscription_id') subscriptionId: string,
  @Query('token') token: string, // Ajoutez le token dans la redirection PayPal
  @Res() res: Response,
) {
  // Inclure le token JWT dans la redirection
  const url = `https://mastertable.site/forfait/success?subscription_id=${subscriptionId}&token=${token}`;
  return res.redirect(url);
}



  @Get('cancel')
  async handleCancel() {
    return {
      message: ' Paiement annulé. Aucune modification n’a été faite.',
    };
  }

  @Get('all')
  // @UseGuards(AuthGuard('jwt'))
  async getAllForfaits() {
    return this.forfaitRepository.find();
  }



  /**
   * 
   * 
   * 
   * 
   * 
   * 
   */
  @Get('success-confirmation')
  @UseGuards(AuthGuard('jwt'))
  async handleSuccess(
    @Query('subscription_id') subscriptionId: string,
    @Req() req: any,
  ) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException('Utilisateur non authentifié');

    if (!subscriptionId) throw new BadRequestException('Subscription ID manquant');

    const subscription = await this.paypalService.getSubscriptionDetails(subscriptionId);
    const planId = subscription.plan_id;

    const forfait = await this.forfaitRepository.findOne({
      where: { paypalplanid: planId },
    });
    if (!forfait) throw new BadRequestException(`Aucun forfait trouvé pour planId : ${planId}`);

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('Utilisateur introuvable');

    // ✅ Mettre à jour le forfait et la date d'expiration
    user.forfait = forfait;
    user.datedowngraded = null;

    if (forfait.validationduration && !isNaN(Number(forfait.validationduration))) {
      user.forfaitexpirationdate = addDays(new Date(), Number(forfait.validationduration));
    } else {
      // Cas "illimité"
      user.forfaitexpirationdate = null;
    }

    const success = await this.userRepository.save(user);

    // ✅ Message d’expiration adapté
    const expirationMsg = user.forfaitexpirationdate
      ? `Expiration le ${user.forfaitexpirationdate.toISOString()}`
      : 'Sans date d’expiration (illimité)';

    await this.notificationService.notifyAll(
      'paiement accepté',
      `Votre forfait ${forfait.nom} a été activé ! ${expirationMsg}`,
    );

    return success;
  }




  @Get('user/forfait')
  @UseGuards(AuthGuard('jwt'))
  async getUserForfait(@Req() req: any) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException('Utilisateur non authentifié');

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['forfait'],
    });
    if (!user) throw new BadRequestException('Utilisateur introuvable');

    return {
      forfait: user.forfait,
      forfaitExpirationDate: user.forfaitexpirationdate,
    };
  }

  @Get('sumAllUsers')
  async getSumForUsersForfait(): Promise<any> {
    return this.forfaitService.getSumForUsersForfait()
  }


  // Pour le super Admin 

  @Get('get/lastTransactions')
  //@UseGuards(AuthGuard('jwt'))
  async getLastTransactions(): Promise<
    { name: string; photo: string; nameForfait: string; amount: number; date: Date }[]
  > {
    return this.forfaitService.findLastTransactions();
  }

  @Get('/revenu-mensuel')
  //@UseGuards(AuthGuard('jwt'))
  getRevenuMensuel(): Promise<{ name: string; total: number; percentage: number }[]> {
    return this.forfaitService.getRevenusPourcentagesParForfait();
  }

  // stat by lioka
  @Get('dashboard-charts')
async getDashboardCharts(@Query('period') period: string = '12') {
  console.log('🔥 Route dashboard-charts appelée avec period:', period);
  
  const periodNumber = parseInt(period) || 12;

  try {
    const [revenueData] = await Promise.all([
      this.forfaitService.getMonthlyForfaitRevenue(periodNumber),
    ]);

    const result = {
      revenue: revenueData,
    };
    
    console.log('✅ Données à retourner:', result);
    return result;
  } catch (error) {
    console.error('❌ Erreur dans getDashboardCharts:', error);
    throw error;
  }
}

// by claudio
// NOUVELLES ROUTES POUR LA GESTION DES FORFAITS
  @Post()
  async create(@Body() createForfaitDto: CreateForfaitDto): Promise<Forfait> {
    return this.forfaitService.create(createForfaitDto);
  }

  //endpoint pour modifier le forfait
  @Patch(':id') // L'ID est passé dans l'URL, par exemple: /forfait/123
  async update(@Param('id') idForfait: number, @Body() updateForfaitDto: UpdateForfaitDto): Promise<Forfait> {
    return this.forfaitService.update(Number(idForfait), updateForfaitDto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: number): Promise<void> {
    return this.forfaitService.remove(id);
  }
}