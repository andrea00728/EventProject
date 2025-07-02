import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { OrderService } from '../../services/order/order.service';
import { Order } from '../../entities/order.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async createOrder(@Body() body: { tableId: number; items: { menuItemId: number; quantity: number }[] }): Promise<Order> {
    return this.orderService.createOrder(body.tableId, body.items);
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard('jwt'))
  async updateOrderStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: 'pending' | 'preparing' | 'served',
  ): Promise<Order> {
    return this.orderService.updateOrderStatus(id, status);
  }

  @Patch(':id/payment')
  @UseGuards(AuthGuard('jwt'))
  async updatePaymentStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('paymentStatus') paymentStatus: 'payé' | 'non payé',
  ): Promise<Order> {
    return this.orderService.updatePaymentStatus(id, paymentStatus);
  }

  @Patch(':id/items')
  @UseGuards(AuthGuard('jwt'))
  async updateOrderItems(
    @Param('id', ParseIntPipe) id: number,
    @Body('items') items: { orderItemId: number; quantity: number }[],
  ): Promise<Order> {
    return this.orderService.updateOrderItems(id, items);
  }

  @Get('table/:tableId')
  @UseGuards(AuthGuard('jwt'))
  async findOrdersByTable(@Param('tableId', ParseIntPipe) tableId: number): Promise<Order[]> {
    return this.orderService.findOrdersByTable(tableId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async cancelOrder(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.orderService.cancelOrder(id);
  }
}