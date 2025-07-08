import { Controller, Post, Get, Patch, Delete, Body, Param, UsePipes, ValidationPipe, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { OrderService } from '../../services/order/order.service';
import { CreateOrderDto, UpdateOrderStatusDto } from 'src/dto/order.dto';
import { AuthGuard } from '@nestjs/passport';
import { Order } from 'src/entities/order.entity';

@Controller('orders')
export class OrderController {
  constructor(private orderService: OrderService) {}

  // @Post()
  // @UseGuards(AuthGuard('jwt')) // Protéger la route avec JWT
  // @UsePipes(new ValidationPipe())
  // createOrder(@Body() body: CreateOrderDto, @Req() req: any) {
  //   const userId = req.user?.id || body.userId; // Priorité à l'utilisateur connecté, sinon body.userId
  //   return this.orderService.createOrder(body.tableId, body.items, body.userId);
  // }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  async create(@Body() dto: CreateOrderDto, @Req() req: any): Promise<Order> {
    const userIdFromToken = req.user?.sub;
    if (!userIdFromToken) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }
    return this.orderService.createOrder(dto.tableId, dto.items, userIdFromToken);
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