import { IsDateString, IsNotEmpty, IsNumber } from "class-validator";

export class CreateEventDto {
  utilisateur_id:string;
   @IsNotEmpty()
  nom: string;
  type: 'mariage' | 'reunion' | 'anniversaire' | 'engagement' | 'autre';

   @IsNotEmpty()
  theme: string;
  @IsNotEmpty()
  @IsDateString()
  date: string;
   @IsNotEmpty()
  @IsDateString()
  date_fin:string;

  @IsNumber()
  locationId: number;
  @IsNumber()
  montanttransaction?: number;
  salleId: number;
}