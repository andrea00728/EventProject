// src/dto/CreateEvenementDTO.ts
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export enum EventType {
  MARIAGE = 'mariage',
  REUNION = 'reunion',
  ANNIVERSAIRE = 'anniversaire',
  ENGAGEMENT = 'engagement',
  FIANCAILLES = 'fiançailles',
  AUTRE = 'autre',
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
  @IsNumberString()
  locationId: number;

  @IsNotEmpty()
  @IsNumberString()
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

  @IsOptional()
  @IsNumber()
  maxGuest?: number;
}

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  nom?: string;

  @IsOptional()
  @IsEnum(EventType)
  type?: EventType;

  @IsOptional()
  @IsString()
  theme?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsDateString()
  date_fin?: string;

  @IsOptional()
  @IsInt()
  locationId?: number;

  @IsOptional()
  @IsInt()
  salleId?: number;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsString()
  imageUrl?: string | null;
}