// tasks.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Evenement } from 'src/entities/Evenement';
import { Personnel } from 'src/entities/Personnel';
import { IAService } from '../ai/ai.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  // Seuil pour déclencher la désactivation (0.3 = 30%)
  private readonly threshold = 0.1;

  constructor(
    @InjectRepository(Evenement)
    private readonly evenementRepo: Repository<Evenement>,
    @InjectRepository(Personnel)
    private readonly personnelRepo: Repository<Personnel>,
    private readonly iaService: IAService,
  ) {}

  @Cron('0 0 * * *') // tous les jours à minuit
  async handleExpiredEvents() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiredEvents = await this.evenementRepo.find({
      where: { date_fin: LessThan(today), isActive: true },
      relations: ['personnels'],
    });

    for (const event of expiredEvents) {
      const dureeEvent = Math.ceil((event.date_fin.getTime() - event.date.getTime()) / (1000 * 60 * 60 * 24));
      const personnel_count = event.personnels.length;
      const maxGuest = event.maxGuest || 0;
      const daysAfterEnd = Math.ceil((today.getTime() - event.date_fin.getTime()) / (1000 * 60 * 60 * 24));

      // Vérifier chaque personnel
      for (const personnel of event.personnels) {
        const payload = {
          duree_event: dureeEvent,
          maxGuest,
          personnel_count,
          jours_apres_fin: daysAfterEnd,
        };
        const result = await this.iaService.predictPersonnelDeleteWithProbability(payload);

        if (result.probability >= this.threshold) {
          personnel.isActive = false;
          await this.personnelRepo.save(personnel);
          this.logger.log(`Personnel ${personnel.nom} désactivé (proba: ${result.probability})`);
        }
      }

      // Vérifier si l'événement doit être désactivé
      const eventResult = await this.iaService.predictPersonnelDeleteWithProbability({
        duree_event: dureeEvent,
        maxGuest,
        personnel_count,
        jours_apres_fin: daysAfterEnd,
      });

      if (eventResult.probability >= this.threshold) {
        event.isActive = false;
        await this.evenementRepo.save(event);
        this.logger.log(`Événement ${event.nom} désactivé (proba: ${eventResult.probability})`);
      }
    }
  }

   async testIA() {
    const events = await this.evenementRepo.find({
      relations: ['personnels'],
      take: 5,
    });

    for (const event of events) {
      const dureeEvent = Math.ceil((event.date_fin.getTime() - event.date.getTime()) / (1000 * 60 * 60 * 24));
      const personnel_count = event.personnels.length;
      const maxGuest = event.maxGuest || 0;
      const daysAfterEnd = Math.ceil((new Date().getTime() - event.date_fin.getTime()) / (1000 * 60 * 60 * 24));

      for (const personnel of event.personnels) {
        const payload = {
          duree_event: dureeEvent,
          maxGuest,
          personnel_count,
          jours_apres_fin: daysAfterEnd,
        };

        const response = await this.iaService.predictPersonnelDeleteWithProbability(payload);
        console.log(`Personnel ${personnel.nom} delete?: ${response.delete}, proba: ${response.probability.toFixed(2)}`);
      }

      const eventResponse = await this.iaService.predictPersonnelDeleteWithProbability({
        duree_event: dureeEvent,
        maxGuest,
        personnel_count,
        jours_apres_fin: daysAfterEnd,
      });
      console.log(`Événement ${event.nom} delete?: ${eventResponse.delete}, proba: ${eventResponse.probability.toFixed(2)}`);
    }
  }
}
