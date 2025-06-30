export class MenuItemDto {
    nom: string;
    quantite: number;
    prix: number;
    // pas de `commande`
  }
  
  export class CommandeDto {
    id: number;
    tableId: number;
    statut: string;
    total: number;
    createdAt: Date;
    items: MenuItemDto[];
  }
  