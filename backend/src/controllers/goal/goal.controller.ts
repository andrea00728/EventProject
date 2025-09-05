// goals.controller.ts
import { Controller, Get, Put, Param, Body } from '@nestjs/common';
import { GoalsService } from 'src/services/goal/goal.service';

@Controller('goal')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Get(':userId')
  getGoal(@Param('userId') userId: string) {
    return this.goalsService.getGoalsByUser(userId);
  }

  @Put(':userId')
  updateGoal(
    @Param('userId') userId: string,
    @Body() data: { monthlyEvents: number; attendeesTarget: number },
  ) {
    return this.goalsService.updateGoals(userId, data);
  }
}

