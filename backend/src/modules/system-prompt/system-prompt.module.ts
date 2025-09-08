import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemPromptService } from 'src/services/system-prompt/system-prompt.service';
import { SystemPromptController } from 'src/controllers/system-prompt/system-prompt.controller';
import { SystemPrompt } from 'src/entities/system-prompt.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SystemPrompt])],
  controllers: [SystemPromptController],
  providers: [SystemPromptService],
  exports: [SystemPromptService], // Exporter pour l'utiliser dans d'autres modules
})
export class SystemPromptModule {}