import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateForfaitDto {
  @IsString()
  nom: string;

  @IsOptional()
  @IsString()
  maxevents?: string | null;

  @IsOptional()
  @IsString()
  maxinvites?: string | null;

  @IsString()
  validationduration: string | null;

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