import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import axios from 'axios';

@Injectable()
export class IAService {
  private IA_URL = 'http://127.0.0.1:8000/predict-delete';


  constructor(private readonly httpService: HttpService) {}

  async predictDelete(payload: {
    duree_event: number;
    maxGuest: number;
    personnel_count: number;
    jours_apres_fin: number;
  }): Promise<{ delete: boolean; probability: number }> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(this.IA_URL, payload),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la communication avec le service IA',
        500,
      );
    }
  }
  async predictPersonnelDeleteWithProbability(payload: {
  duree_event: number;
  maxGuest: number;
  personnel_count: number;
  jours_apres_fin: number;
}): Promise<{ delete: boolean, probability: number }> {
  try {
    const response = await axios.post(`${this.IA_URL}`, payload);
    return { delete: response.data.delete, probability: response.data.probability };
  } catch (error) {
    console.error('Erreur IA:', error.message);
    return { delete: false, probability: 0 };
  }
}

}
