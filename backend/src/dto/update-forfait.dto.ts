import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateForfaitDto {
  @IsOptional()
  @IsString()
  nom?: string;

  @IsOptional()
  @IsNumber()
  maxevents?: number | null;

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
}