// backend/src/modules/goal/goal.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Goal } from 'src/entities/Goal';
import { User } from 'src/Authentication/entities/auth.entity';
import { GoalsService } from 'src/services/goal/goal.service';
import { GoalsController } from 'src/controllers/goal/goal.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Goal, User])],
  providers: [GoalsService],
  controllers: [GoalsController],
  exports: [GoalsService], // si d'autres modules doivent utiliser le service
})
export class GoalModule {}
