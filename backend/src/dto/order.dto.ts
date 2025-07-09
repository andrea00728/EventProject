import { IsString, IsInt, IsArray, IsEnum, Min, ValidateNested, IsOptional, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @IsInt()
  menuItemId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsInt()
  tableId: number;

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
}

export class UpdateOrderStatusDto {
  @IsEnum(['pending', 'preparing', 'served'])
  status: 'pending' | 'preparing' | 'served';
}