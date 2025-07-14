import { Controller, Post, Get, Patch, Delete, Body, Param, UsePipes, ValidationPipe } from '@nestjs/common';
import { OrderService } from '../../services/order/order.service';
import { CreateOrderDto, UpdateOrderStatusDto } from 'src/dto/order.dto';

@Controller('orders')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  createOrder(@Body() body: CreateOrderDto) {
    return this.orderService.createOrder(body.tableId, body.items);
  }

  @Get()
  findAllOrders() {
    return this.orderService.findAllOrders();
  }

  @Patch(':id/status')
  @UsePipes(new ValidationPipe())
  updateOrderStatus(@Param('id') id: number, @Body() body: UpdateOrderStatusDto) {
    return this.orderService.updateOrderStatus(id, body.status);
  }

  @Get('table/:tableId')
  findOrdersByTable(@Param('tableId') tableId: number) {
    return this.orderService.findOrdersByTable(tableId);
  }

  @Delete(':id')
  cancelOrder(@Param('id') id: number) {
    return this.orderService.cancelOrder(id);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe())
  pdateOrder(
  @Param('id') id: number,
  @Body() body: CreateOrderDto // même DTO que pour créer
) {
  return this.orderService.updateOrder(id, body.tableId, body.items);
}

}