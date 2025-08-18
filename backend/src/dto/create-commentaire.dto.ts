import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { SatisfactionLevel } from 'src/entities/Commentaire';

export class CreateCommentaireDto {
  @ApiProperty({ description: 'Contenu du commentaire', example: 'Ceci est un commentaire' })
  @IsString()
  @IsNotEmpty()
  contenu: string;

  @IsEnum(SatisfactionLevel)
  satisfaction:SatisfactionLevel;
}