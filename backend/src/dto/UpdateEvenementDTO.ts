import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { EventType } from './CreateEvenementDTO';

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
  @IsNumber()
  locationId?: number;

  @IsOptional()
  @IsNumber()
  salleId?: number;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsNumber()
  montanttransaction?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsUUID()
  utilisateur_id: string; // Toujours requis pour vérifier l'utilisateur
}