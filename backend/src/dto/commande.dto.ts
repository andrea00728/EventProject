import { MenuItemDto } from './menu-item.dto';

export class CommandeDto {
  id: number;
  tableId: number;
  eventId: number;
  statut: string;
  total: number;
  createdAt: Date;
  items: MenuItemDto[];
}
