export class CreateTableDto {
  nom:string;
  capacite: number;
  eventId: number;
  type: 'ronde' | 'carree' | 'rectangle' | 'ovale';
  position?: { left: number; top: number };
  nombre?: number;
}


