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
  @IsOptional()
  @IsString()
  nom?: string;

  @IsOptional()
  @IsEnum(EventType)
  type?: string;

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
  @IsUUID()
  locationId?: string | number;

  @IsOptional()
  @IsUUID()
  salleId?: string | number;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  nomLieu?: string;
}