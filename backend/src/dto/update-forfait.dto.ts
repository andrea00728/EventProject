import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateForfaitDto {
  @IsOptional()
  @IsString()
  nom?: string;

  @IsOptional()
  @IsString()
  maxevents?: string | null;

  @IsOptional()
  @IsNumber()
  maxinvites?: number;

  @IsOptional()
  @IsNumber()
  validationduration?: number;

  @IsOptional()
  @IsString()
  paypalplanid?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  fonctionnalite?: string;

  @IsOptional()
  @IsString()
  ideal?: string;
}