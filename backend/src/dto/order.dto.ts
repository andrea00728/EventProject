import { IsString, IsInt, IsArray, IsEnum, Min, ValidateNested, IsOptional, IsEmail, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @IsInt()
  menuItemId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  slug: string

  @IsString()
  @IsOptional()
  nom: string;

  @IsEmail()
  @IsOptional()
  email: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
  tableId: number;
}

export class UpdateOrderStatusDto {
  @IsEnum(['pending', 'preparing', 'served'])
  status: 'pending' | 'preparing' | 'served';
}
