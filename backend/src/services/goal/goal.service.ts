import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Goal } from 'src/entities/Goal';
import { User } from 'src/Authentication/entities/auth.entity';

@Injectable()
export class GoalsService {
  constructor(
    @InjectRepository(Goal)
    private goalRepository: Repository<Goal>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async getGoalsByUser(userId: string) {
    // Cherche l'objectif existant
    let goal = await this.goalRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'], // ⚠️ s'assurer que la relation est jointe
    });

    if (!goal) {
      // Crée un goal si inexistant
      goal = this.goalRepository.create({
        user: { id: userId } as User, // ✅ liaison par id suffit
        monthlyEvents: 3,
        attendeesTarget: 50,
      });

      await this.goalRepository.save(goal);
    }

    return goal;
  }


  async updateGoals(userId: string, data: { monthlyEvents: number; attendeesTarget: number }) {
    const goal = await this.goalRepository.findOne({ where: { user: { id: userId } } });
    if (!goal) throw new Error('Objectif non trouvé');
    goal.monthlyEvents = data.monthlyEvents;
    goal.attendeesTarget = data.attendeesTarget;
    return this.goalRepository.save(goal);
  }
}
