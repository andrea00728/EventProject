import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GeminiService } from 'src/services/gemini/gemini.service';
import { GeminiController } from 'src/controllers/gemini/gemini.controller';
import { SystemPrompt } from 'src/entities/system-prompt.entity';
import { SystemPromptModule } from '../system-prompt/system-prompt.module';


@Module({
    imports: [HttpModule, SystemPrompt, SystemPromptModule],
    controllers: [GeminiController],
    providers: [GeminiService],
    exports: [GeminiService],
})
export class GeminiModule {}
