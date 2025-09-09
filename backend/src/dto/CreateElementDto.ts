import { IsNumber, IsString, IsOptional, IsObject } from 'class-validator';

export class CreateElementDto {
  @IsNumber()
  eventId: number;

  @IsString()
  nom: string;

  @IsString()
  type: string;

  @IsOptional()
  @IsObject()
  position?: { left: number; top: number };

  @IsOptional()
  @IsNumber()
  rotation?: number;

  @IsOptional()
  @IsNumber()
  width?: number;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsNumber()
  nombre?: number;

  @IsOptional()
  @IsString()
  color?: string; // Ajout du champ color
}
