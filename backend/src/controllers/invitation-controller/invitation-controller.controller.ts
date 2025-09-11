import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Req,
  UseGuards,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateInvitationDto } from 'src/dto/CreateInvitatioDto';
import { Invitation } from 'src/entities/Invitation';
import { InvitationService } from 'src/services/invitation-service/invitation-service.service';
import { NotificationService } from 'src/services/notification/notification.service';

@Controller('invitations')
export class InvitationController {
  constructor(
    private readonly invitationService: InvitationService,
    private readonly notificationService:NotificationService,
  ) {}

  /**
   * 
   * @param dto 
   * @returns 
   * 
   * controller pour l'evolement de l'invitation
   * 
   * 
   */
  @Post('/invit')
  async createInvitation(
    @Body() dto: CreateInvitationDto,
  ): Promise<Invitation> {
    try {
      const invitation= await this.invitationService.createInvitation(dto);
      await this.notificationService.notifyAll(
        'ivitation envoyee',
        `invitation evoye pour l'evenement ${dto.eventId}`,
      )
      return invitation;
      
    } catch (error) {
      console.error('Erreur backend:', error);
      throw new HttpException(
        'Erreur lors de la création ou de l’envoi des invitations',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


@Post('/qrCodeVerification')
@UseGuards(AuthGuard('jwt'))
async VerificationQrCode(
  @Req() req,
  @Body() body: { qrCode: string }
) {
  const userEmail = req.user?.email; 
  if (!body.qrCode) {
    throw new BadRequestException('QR code invalide');
  }

  try {
  const result = await this.invitationService.VerificationQrcode(body.qrCode, userEmail);
  return result;
} catch (error) {
  throw error; 
}

}
}

