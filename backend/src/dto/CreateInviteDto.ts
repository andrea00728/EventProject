export class CreateInviteDto {
  nom: string;
  prenom: string;
  email: string;
  sex: 'M' | 'F';
  eventId: number;
}