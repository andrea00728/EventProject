export class CreatePersonnelDto {
  nom: string;
  email: string;
  role: 'cuisinier' | 'accueil' | 'caissier';
  evenementId: number; 
}
