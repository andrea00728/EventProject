import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateForfaitDto {
  @IsString()
  nom: string;

  @IsOptional()
  @IsNumber()
  maxevents?: number | null;

  @IsOptional()
  @IsNumber()
  maxinvites?: number;

  @IsNumber()
  validationduration: number;

  @IsOptional()
  @IsString()
  paypalplanid?: string;

  @IsNumber()
  price: number;
}