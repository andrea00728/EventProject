import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateForfaitDto {
  @IsString()
  nom: string;

  @IsOptional()
  @IsString()
  maxevents?: string | null;

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
  
  @IsOptional()
  @IsString()
  fonctionnalite?: string;

  @IsOptional()
  @IsString()
  ideal?: string;
  
}