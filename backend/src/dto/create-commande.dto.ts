import { MenuItem } from "src/entities/menu-item.entity";

// dto/create-commande.dto.ts
export class CreateCommandeDto {
    eventId: number;
    tableId: number;
    items: MenuItem[];
    total: number;
  }
  