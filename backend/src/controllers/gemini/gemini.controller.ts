import { Controller, Post, Body } from '@nestjs/common';
import { GeminiService } from 'src/services/gemini/gemini.service';

@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Post('generate')
  async generate(@Body('prompt') prompt: string) {
    return { response: await this.geminiService.generate(prompt) };
  }
}
