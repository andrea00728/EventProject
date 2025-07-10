import { IsString, IsInt, IsNumber, IsEnum, Min } from 'class-validator';

export class CreateMenuDto {
  @IsString()
  name: string;

  @IsInt()
  eventId: number;
}

export class CreateMenuItemDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsEnum(['starter', 'main', 'dessert', 'drink'])
  category: string;

  @IsInt()
  @Min(0)
  stock: number; // Propriété pour le stock
}

export class RestockMenuItemDto {
  @IsInt()
  @Min(1)
  quantity: number;
}