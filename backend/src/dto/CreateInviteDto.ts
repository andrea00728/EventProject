export class CreateInviteDto {
  evenementId(evenementId: any) {
      throw new Error('Method not implemented.');
  }
  nom: string;
  prenom: string;
  email: string;
  sex: 'M' | 'F';
  eventId: number;
}