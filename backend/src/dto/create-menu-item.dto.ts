export class CreateMenuItemDto {
    nom: string;
    prix: number;
    stock: number;
    eventId: number;
    categorieId?: number;
    description?: string;
    photoUrl?: string;
    allergenes?: string;
  }
  