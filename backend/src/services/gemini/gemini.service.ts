import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GeminiService {
  private readonly GEMINI_URL ='https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-lite:generateContent';
  private readonly API_KEY = process.env.GEMINI_API_KEY;

  constructor(private readonly httpService: HttpService) {
    console.log('✅ Clé API Gemini chargée :', this.API_KEY);
  }

  async generate(prompt: string): Promise<string> {
    // Prompt système qui limite le domaine de réponse
    const systemPrompt = `
Tu es une intelligence artificielle experte de la plateforme "MasterTable", une application web de gestion d’événements avec plans de table interactifs.

Tu peux répondre uniquement à des questions en lien avec :
- La création et la gestion d’événements
- Le placement d’invités sur des plans de tables
- La restauration associée à un événement
- Les QR codes, la galerie photo, les modules sociaux (chat, mini-jeux)
- Le tableau de bord de l’organisateur
- Les abonnements, les statistiques et les technologies utilisées dans MasterTable

Si la question sort de ce cadre, tu dois répondre :
"Je suis désolé, je ne peux répondre qu’aux questions liées à la plateforme MasterTable."

Toujours répondre en français, de façon claire et concise.
`;

    const body = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${systemPrompt}\n\nQuestion de l'utilisateur : ${prompt}`,
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
