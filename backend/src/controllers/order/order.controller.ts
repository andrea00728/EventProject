import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { OrderService } from '../../services/order/order.service';
import { Order } from '../../entities/order.entity';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { MenuItem } from '../../entities/menu-item.entity';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'caisse')
  async createOrder(@Body() body: { tableId: number; items: { menuItemId: number; quantity: number }[]; eventId: number }): Promise<Order> {
    return this.orderService.createOrder(body.tableId, body.items, body.eventId);
  }

  @Post('client')
  async createClientOrder(@Body() body: { tableId: number; items: { menuItemId: number; quantity: number }[]; eventId: number }): Promise<Order> {
    return this.orderService.createOrder(body.tableId, body.items, body.eventId, true);
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('cuisine')
  async updateOrderStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: 'PENDING' | 'IN_PROGRESS' | 'READY',
    @Body('eventId', ParseIntPipe) eventId: number,
  ): Promise<Order> {
    return this.orderService.updateOrderStatus(id, status, eventId);
  }

  @Patch(':id/payment')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('caisse')
  async updatePaymentStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('paymentStatus') paymentStatus: 'payé' | 'non payé',
    @Body('eventId', ParseIntPipe) eventId: number,
  ): Promise<Order> {
    return this.orderService.updatePaymentStatus(id, paymentStatus, eventId);
  }

  @Patch(':id/items')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'caisse')
  async updateOrderItems(
    @Param('id', ParseIntPipe) id: number,
    @Body('items') items: { orderItemId: number; quantity: number }[],
    @Body('eventId', ParseIntPipe) eventId: number,
  ): Promise<Order> {
    return this.orderService.updateOrderItems(id, items, eventId);
  }

  @Get('table/:tableId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'caisse')
  async findOrdersByTable(@Param('tableId', ParseIntPipe) tableId: number, @Query('eventId', ParseIntPipe) eventId: number): Promise<Order[]> {
    return this.orderService.findOrdersByTable(tableId, eventId);
  }

  @Get('kitchen')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('cuisine')
  async findOrdersForKitchen(@Query('eventId', ParseIntPipe) eventId: number): Promise<{ id: number; items: { name: string; quantity: number }[]; status: string }[]> {
    return this.orderService.findOrdersForKitchen(eventId);
  }

  @Get('low-stock')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async getLowStockItems(@Query('eventId', ParseIntPipe) eventId: number): Promise<MenuItem[]> {
    return this.orderService.getLowStockItems(eventId);
  }

  @Get('stats')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async getOrderStats(@Query('eventId', ParseIntPipe) eventId: number): Promise<{ totalSales: number; ordersByStatus: Record<string, number> }> {
    return this.orderService.getOrderStats(eventId);
  }

  @Get(':id/receipt')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('caisse')
  async getReceipt(@Param('id', ParseIntPipe) id: number, @Query('eventId', ParseIntPipe) eventId: number): Promise<string> {
    return this.orderService.generateReceipt(id, eventId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'caisse')
  async cancelOrder(@Param('id', ParseIntPipe) id: number, @Body('eventId', ParseIntPipe) eventId: number): Promise<void> {
    return this.orderService.cancelOrder(id, eventId);
  }
}