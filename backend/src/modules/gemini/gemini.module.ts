import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GeminiService } from 'src/services/gemini/gemini.service';
import { GeminiController } from 'src/controllers/gemini/gemini.controller';


@Module({
    imports: [HttpModule],
    controllers: [GeminiController],
    providers: [GeminiService],
    exports: [GeminiService],
})
export class GeminiModule {}
