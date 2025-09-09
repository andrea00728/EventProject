export class CreateTableDto {
  nom:string;
  capacite: number;
  eventId: number;
  type: 'ronde' | 'carree' | 'rectangle' | 'ovale' | 'triangle';
  position?: { left: number; top: number };
  nombre?: number;
}


