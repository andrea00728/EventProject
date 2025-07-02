import { Controller, Post, Get, Patch, Delete, Body, Param, UsePipes, ValidationPipe, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrderService } from '../../services/order/order.service';
import { CreateOrderDto, UpdateOrderStatusDto } from '../../dto/order.dto';

@Controller('orders')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  async createOrder(@Body() body: CreateOrderDto, @Req() req: any) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException('Utilisateur non authentifié');
    return this.orderService.createOrder(body.tableId, body.items);
  }

  @Patch(':id/status')
  @UsePipes(new ValidationPipe())
  updateOrderStatus(@Param('id') id: number, @Body() body: UpdateOrderStatusDto) {
    return this.orderService.updateOrderStatus(id, body.status);
  }

  @Get('table/:tableId')
  @UseGuards(AuthGuard('jwt'))
  async findOrdersByTable(@Param('tableId') tableId: number, @Req() req: any) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException('Utilisateur non authentifié');
    return this.orderService.findOrdersByTable(tableId);
  }

  @Delete(':id')
  cancelOrder(@Param('id') id: number) {
    return this.orderService.cancelOrder(id);
  }
}