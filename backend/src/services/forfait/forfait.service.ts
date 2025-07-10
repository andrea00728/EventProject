import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/Authentication/entities/auth.entity';
import { Evenement } from 'src/entities/Evenement';

@Injectable()
export class ForfaitService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Evenement)
    private evenementRepository:Repository<Evenement>,
  ) {}

 async canCreateEvent(userId: string): Promise<boolean> {
  console.log(`Checking if user ${userId} can create event`);

  // Charger juste l'utilisateur avec son forfait
  const user = await this.userRepo.findOne({
    where: { id: userId },
    relations: ['forfait'],
  });

  if (!user) {
    console.log(`User ${userId} not found`);
    return false; // ou throw une erreur selon ton besoin
  }

  const maxEvents = user.forfait?.maxevents;

  console.log(`Max events for this forfait is ${maxEvents}`);

  // Si maxEvents est null ou undefined => illimité
  if (maxEvents === null || maxEvents === undefined) {
    console.log('No max events specified, allowing creation');
    return true;
  }

  // Compter directement le nombre d'événements de l'utilisateur dans la base
  const count = await this.evenementRepository.count({
    where: { user: { id: userId } },
  });

  console.log(`User has already created ${count} events`);

  return count < maxEvents;
}


  async canAddInvite(userId: string, currentInviteCount: number): Promise<boolean> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['forfait'],
    });

    const maxInvites = user?.forfait?.maxinvites;

    if (maxInvites === null || maxInvites === undefined) return true;

    return currentInviteCount < maxInvites;
  }

  async isForfaitExpired(userId: string): Promise<boolean> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['forfait'],
    });

    const expiration = user?.forfait?.expirationdate;
    if (!expiration) return false;

    return new Date() > new Date(expiration);
  }
}
