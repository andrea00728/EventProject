import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CreateInvitationDto } from 'src/dto/CreateInvitatioDto';
import { Invitation } from 'src/entities/Invitation';
import { InvitationService } from 'src/services/invitation-service/invitation-service.service';

@Controller('invitations')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  //  Créer une invitation + envoi des mails
  @Post()
  async createInvitation(
    @Body() dto: CreateInvitationDto,
  ): Promise<Invitation> {
    try {
      return await this.invitationService.createInvitation(dto);
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la création ou de l’envoi des invitations',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
