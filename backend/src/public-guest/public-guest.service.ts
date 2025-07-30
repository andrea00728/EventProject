// backend/src/services/public-guest.service.ts
import { Injectable } from '@nestjs/common';
import { CreatePublicGuestDto } from './dto/create-public-guest.dto';
import { GuestService } from '../services/invite-service/invite-service.service';
import { CreateInviteDto } from 'src/dto/CreateInviteDto';

@Injectable()
export class PublicGuestService {
  constructor(private readonly guestService: GuestService) {}

  async create(dto: CreatePublicGuestDto) {
  const eventId = parseInt(dto.evenementId);
  if (isNaN(eventId)) {
    throw new Error('eventId invalide');
  }

  // Adapter ici si les champs sont compatibles
  const adaptedDto: CreateInviteDto = {
      nom: dto.nom,
      prenom: dto.prenom,
      email: dto.email,
      evenementId: function (evenementId: any): void {
          throw new Error('Function not implemented.');
      },
      sex: 'M',
      eventId: 0
  };

  // utiliser 'public-guest' comme ID spécial
  return this.guestService.createGuest(adaptedDto, eventId, 'public-guest');
}
}
