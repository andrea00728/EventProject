export class CreateElementDto {
  nom: string;
  type: string;
  eventId: number;
  position?: { left: number; top: number };
  rotation?: number;
  width?: number;
  height?: number;
  nombre?: number;
}