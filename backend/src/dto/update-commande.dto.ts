import { CommandeStatus } from '../entities/commande.entity';

export class UpdateCommandeDto {
  tableId?: number;
  total?: number;
  statut?: CommandeStatus;
  items?: {
    nom: string;
    quantite: number;
    prix: number;
    stock: number;
    categorieId: number;
  }[];
}
