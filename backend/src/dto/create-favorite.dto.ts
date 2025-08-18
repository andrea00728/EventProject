import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateFavoriteDto {
  @IsInt()
  evenementId: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  note?: string;
}