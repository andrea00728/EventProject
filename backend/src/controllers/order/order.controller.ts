import { Controller, Post, Get, Patch, Delete, Body, Param, UsePipes, ValidationPipe, UseGuards, Req, UnauthorizedException, Request, NotFoundException, ParseIntPipe } from '@nestjs/common';
import { OrderService } from '../../services/order/order.service';
import { CreateOrderDto, UpdateOrderStatusDto } from 'src/dto/order.dto';
import { AuthGuard } from '@nestjs/passport';
import { Order } from 'src/entities/order.entity';
import { Payment } from 'src/entities/payment.entity';

@Controller('orders')
export class OrderController {
  constructor(private orderService: OrderService) {}


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




  @Delete(':id')
  cancelOrder(@Param('id') id: number) {
    return this.orderService.cancelOrder(id);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe())
  pdateOrder(
  @Param('id') id: number,
  @Body() body: CreateOrderDto
) {
  return this.orderService.updateOrder(id, body.tableId, body.items);
}

@Patch(':id/status')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  async updateOrderStatus(
    @Param('id') id: number,
    @Body() body: UpdateOrderStatusDto,
    @Request() req: any,
  ): Promise<Order> {
    const userId = req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }
    return this.orderService.updateOrderStatus(id, body.status, userId);
  }

  @Patch(':id/payment')
  @UseGuards(AuthGuard('jwt'))
  async validatePayment(@Param('id') id: number, @Request() req: any): Promise<Order> {
    const userId = req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }
    return this.orderService.validatePayment(id, userId);
  }

  @Get('balance/:eventId')
  @UseGuards(AuthGuard('jwt'))
  async getBalance(@Param('eventId') eventId: number, @Request() req: any): Promise<number> {
    const userId = req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }
    return this.orderService.getBalance(eventId, userId);
  }

  @Get('payments/:eventId')
  @UseGuards(AuthGuard('jwt'))
  async getPaymentsByEvent(@Param('eventId') eventId: number, @Request() req: any): Promise<Payment[]> {
    const userId = req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }
    return this.orderService.getPaymentsByEvent(eventId, userId);
  }

  @Get('table/:tableId')
  @UseGuards(AuthGuard('jwt'))
  async findOrdersByTable(@Param('tableId') tableId: number): Promise<(Order & { total: number })[]> {
    return this.orderService.findOrdersByTable(tableId);
  }


  @Get(':id')
  async findOrderById(@Param('id', ParseIntPipe) id: number) {
    const order = await this.orderService.findById(id);
    if (!order) {
      throw new NotFoundException(`Commande avec id ${id} non trouvée`);
    }
    return order;
}


}