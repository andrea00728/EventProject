export class CreateEventDto {
  utilisateur_id:string;
  nom: string;
  type: 'mariage' | 'reunion' | 'anniversaire' | 'engagement' | 'autre';
  theme: string;
  date: Date;
  date_fin:Date;
  locationId: number;
  montanttransaction?: number;
  salleId: number;
}