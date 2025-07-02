export class CreateEventDto {
  utilisateur_id:string;
  nom: string;
  type: 'mariage' | 'reunion' | 'anniversaire' | 'engagement' | 'autre';
  theme: string;
  date: Date;
  locationId: number;
  salleId: number;
}