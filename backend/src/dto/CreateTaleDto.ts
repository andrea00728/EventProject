export class CreateTableDto {
  numero: number;
  capacite: number;
  eventId: number;
  type: 'ronde' | 'carree' | 'rectangle' | 'ovale';
  position?: { left: number; top: number };
}


