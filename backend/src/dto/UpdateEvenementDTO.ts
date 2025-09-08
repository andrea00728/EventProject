import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
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

export class UpdateEventDto {
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
  isPublic: boolean;

  @IsOptional()
  @IsNumber()
  montanttransaction?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}