import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SystemPromptService } from '../system-prompt/system-prompt.service';

@Injectable()
export class GeminiService {
  private readonly GEMINI_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-lite:generateContent';
  private readonly API_KEY = process.env.GEMINI_API_KEY;

  constructor(
    private readonly httpService: HttpService,
    private readonly systemPromptService: SystemPromptService,
  ) {
    console.log('✅ Clé API Gemini chargée :', this.API_KEY);
  }

  async generate(prompt: string): Promise<string> {
    const systemPrompt = await this.systemPromptService.getActivePrompt();

    const body = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${systemPrompt.content}\n\nQuestion de l'utilisateur : ${prompt}`,
            },
          ],
        },
      ],
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.GEMINI_URL}?key=${this.API_KEY}`,
          body,
          {
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      );

      const result = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      return result || 'Aucune réponse générée.';
    } catch (err) {
      console.error('💥 Erreur Gemini :', err.response?.data || err.message);
      throw new HttpException(
        'Erreur Gemini: ' +
          (err.response?.data?.error?.message || err.message),
        err.response?.status || 500,
      );
    }
  }
}