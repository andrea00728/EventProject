import {  BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/Authentication/entities/auth.entity';
import { Evenement } from 'src/entities/Evenement';
import { Forfait } from 'src/entities/Forfait';

@Injectable()
export class ForfaitService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Evenement)
    private evenementRepository:Repository<Evenement>,
    @InjectRepository(Forfait) 
    private forfaitRepository:Repository<Forfait>
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

  // async isForfaitExpired(userId: string): Promise<boolean> {
  //   const user = await this.userRepo.findOne({
  //     where: { id: userId },
  //     relations: ['forfait'],
  //   });

  //   const expiration = user?.forfait?.expirationdate;
  //   if (!expiration) return false;

  //   return new Date() > new Date(expiration);
  // }



  /**
   * 
   * @param userId 
   * utilise pour léxpiration
   */
    async checkForfaitExpiration(userId: string): Promise<void> {
  const user = await this.userRepo.findOne({
    where: { id: userId },
    relations: ['forfait'],
  });
  if (!user) throw new BadRequestException('Utilisateur introuvable');

  const now = new Date();
  if (user.forfaitexpirationdate && user.forfaitexpirationdate < now && user.forfait.nom !== 'freemium') {
    // Rétrograder vers freemium si le forfait a expiré
    const freemiumForfait = await this.forfaitRepository.findOne({ where: { nom: 'freemium' } });
    if (!freemiumForfait) throw new BadRequestException('Forfait freemium introuvable');

    user.forfait = freemiumForfait;
    user.datedowngraded = now;
    user.forfaitexpirationdate = null; // Pas d'expiration pour freemium
    await this.userRepo.save(user);
    console.log(`Utilisateur ${userId} rétrogradé à freemium car le forfait a expiré.`);
  }
}
}
