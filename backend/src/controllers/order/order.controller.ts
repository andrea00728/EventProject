import { Controller, Post, Get, Patch, Delete, Body, Param, UsePipes, ValidationPipe, UseGuards, Req, UnauthorizedException, Request, NotFoundException, ParseIntPipe, BadRequestException, Query } from '@nestjs/common';
import { OrderService } from '../../services/order/order.service';
import { CreateOrderDto, UpdateOrderStatusDto } from 'src/dto/order.dto';
import { AuthGuard } from '@nestjs/passport';
import { Order } from 'src/entities/order.entity';
import { Payment } from 'src/entities/payment.entity';
import { TableEvent } from 'src/entities/Table';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Controller('orders')
export class OrderController {
  constructor(private orderService: OrderService,
    @InjectRepository(TableEvent)
    private readonly tableRepository: Repository<TableEvent>,
  ) {}

// src/controllers/order/order.controller.ts
@Post()
@UsePipes(new ValidationPipe())
async create(@Body() dto: CreateOrderDto): Promise<Order> {
  // Vérifier que la table existe
  const table = await this.tableRepository.findOne({
    where: { id: dto.tableId },
    relations: ['event'],
  });
  if (!table) {
    throw new BadRequestException(`Table avec ID ${dto.tableId} non trouvée`);
  }
  // Appeler createOrder sans eventId
  return this.orderService.createOrder(dto.tableId, dto.items, dto.nom, dto.email);
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
  updateOrder(@Param('id') id: number, @Body() body: CreateOrderDto) {
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

  @Get('event/:eventId')
  async findOrdersByEvent(@Param('eventId', ParseIntPipe) eventId: number): Promise<(Order & { total: number })[]> {
    const orders = await this.orderService.findOrdersByEvent(eventId);
    if (!orders || orders.length === 0) {
      throw new NotFoundException(`No orders found for event with id ${eventId}`);
    }
    return orders;
  }

  @Get('search')
  async findOrdersByNameOrEmail(@Query('search') search: string): Promise<(Order & { total: number })[]> {
    if (!search) {
      throw new BadRequestException('Search query is required');
    }
    const orders = await this.orderService.findOrdersByNameOrEmail(search);
    if (!orders || orders.length === 0) {
      throw new NotFoundException(`No orders found for search query: ${search}`);
    }
    return orders;
  }

  
}