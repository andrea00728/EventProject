import { IsInt, IsArray, IsEnum, Min, ValidateNested } from 'class-validator';
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

  @IsArray()
  @ValidateNested({ each: true }) // 👈 permet la validation imbriquée
  @Type(() => CreateOrderItemDto) // 👈 transforme chaque objet en CreateOrderItemDto
  items: CreateOrderItemDto[];
}

export class UpdateOrderStatusDto {
  @IsEnum(['pending', 'preparing', 'served', 'paid'])
  status: 'pending' | 'preparing' | 'served' | 'paid';
}
