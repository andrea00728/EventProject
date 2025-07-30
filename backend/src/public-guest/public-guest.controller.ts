import { Body, Controller, Post } from '@nestjs/common';
import { PublicGuestService } from '../public-guest/public-guest.service';
import { CreatePublicGuestDto } from './dto/create-public-guest.dto';
import { Public } from '../common/decorators/public.decorator'; // 👈 Assure-toi que le chemin est correct

@Controller('public-guest')
export class PublicGuestController {
  constructor(private readonly publicGuestService: PublicGuestService) {}

  @Public() // 👈 AJOUTE CE DECORATEUR
  @Post('create')
  async create(@Body() dto: CreatePublicGuestDto) {
    const eventId = parseInt(dto.evenementId, 10);
    if (isNaN(eventId)) {
      throw new Error('evenementId invalide');
    }

    return this.publicGuestService.create(dto);
  }
}
