import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Satisfaction } from 'src/entities/satisfaction.entity';
import { SatisfactionService } from 'src/services/satisfaction/satisfaction.service';
import { SatisfactionController } from 'src/controllers/satisfaction/satisfaction.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Satisfaction])],
  providers: [SatisfactionService],
  controllers: [SatisfactionController],
})
export class SatisfactionModule {}