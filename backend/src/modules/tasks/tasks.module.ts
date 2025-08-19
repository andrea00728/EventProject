import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Evenement } from 'src/entities/Evenement';
import { Personnel } from 'src/entities/Personnel';
import { IAService } from 'src/services/ai/ai.service';

import { TasksService } from 'src/services/tasks/tasks.service';

@Module({
    imports:[
        TypeOrmModule.forFeature([Evenement,Personnel]),
        HttpModule,
    ],
    providers:[TasksService,IAService],
    exports:[TasksService],
})
export class TasksModule {}
