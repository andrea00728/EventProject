import { IsInt, IsArray, IsEnum, Min } from 'class-validator';

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
  items: CreateOrderItemDto[];
}

export class UpdateOrderStatusDto {
  @IsEnum(['pending', 'preparing', 'served', 'paid'])
  status: 'pending' | 'preparing' | 'served' | 'paid';
}