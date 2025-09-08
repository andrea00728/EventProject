// dto/CreateEvenementDTO.ts
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID
} from 'class-validator';

export enum EventType {
  MARIAGE = 'mariage',
  REUNION = 'reunion',
  ANNIVERSAIRE = 'anniversaire',
  ENGAGEMENT = 'engagement',
  AUTRE = 'autre'
}

export class CreateEventDto {
  @IsUUID()
  utilisateur_id: string;

  @IsNotEmpty()
  @IsString()
  nom: string;

  @IsNotEmpty()
  @IsEnum(EventType)
  type: EventType;

  @IsNotEmpty()
  @IsString()
  theme: string;

  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsNotEmpty()
  @IsDateString()
  date_fin: string;

  @IsNotEmpty()
  @IsNumber()
  locationId: number;

  @IsNotEmpty()
  @IsNumber()
  salleId: number;

  @IsNotEmpty()
  @IsBoolean()
  isPublic: boolean; // toujours présent, valeur forcée depuis le frontend

  @IsNotEmpty()
  @IsNumber()
  montanttransaction?: number;

  @IsNotEmpty()
  @IsString()
  imageUrl?: string;
}
