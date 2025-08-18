import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evenement } from 'src/entities/Evenement';
import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { CreateInviteDto } from 'src/dto/CreateInviteDto';
import { GuestService } from 'src/services/invite-service/invite-service.service';

@Controller('public-guest')
export class PublicGuestController {
  constructor(
    private readonly guestService: GuestService,
    @InjectRepository(Evenement)
    private readonly eventRepository: Repository<Evenement>,
  ) {}

  @Post('create')
  async createPublicInvite(@Body() dto: CreateInviteDto) {
    try {
      // Recherche dynamiquement un événement public (avec isPublic = true)
      const event = await this.eventRepository.findOne({
        where: { isPublic: true },
      });

      if (!event) {
        throw new HttpException("Aucun événement public trouvé", HttpStatus.NOT_FOUND);
      }

      // Crée l'invité en associant l'invitation à l'événement public trouvé
      return await this.guestService.createGuest(dto, event.id, null);
    } catch (error) {
      // Pour debug, tu peux logger error ici si besoin
      throw new HttpException(error.message || 'Erreur lors de la création de l\'invité public', HttpStatus.BAD_REQUEST);
    }
  }
}
