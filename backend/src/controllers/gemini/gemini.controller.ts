import { Controller, Post, Body } from '@nestjs/common';
import { GeminiService } from 'src/services/gemini/gemini.service';

@Controller('mastertable/chat')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Post()
  async chat(@Body('prompt') prompt: string) {
    const response = await this.geminiService.generate(prompt);
    return { response };
  }
}
