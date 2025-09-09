import { Controller, Get, Post } from '@nestjs/common';
import { TasksService } from 'src/services/tasks/tasks.service';

@Controller('tasks')
export class TasksController {
    constructor(
        private readonly tasksService: TasksService
    ) {}

    @Get('test-ia')
    async testIA(){
        return this.tasksService.testIA();
    }

    @Post('run-cron')
  async runCronManually() {
    await this.tasksService.handleExpiredEvents();
    return { message: 'Cron exécuté manuellement' };
  }
}
