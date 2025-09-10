import { Controller, Post, Get, Patch, Delete, Body, Param, UsePipes, ValidationPipe, UseGuards, Request, UnauthorizedException, NotFoundException, ParseIntPipe, BadRequestException, Query } from '@nestjs/common';
import { OrderService } from '../../services/order/order.service';
import { CreateOrderDto, UpdateOrderStatusDto, RefundOrderDto } from 'src/dto/order.dto';
import { AuthGuard } from '@nestjs/passport';
import { Order } from 'src/entities/order.entity';
import { Payment } from 'src/entities/payment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/Authentication/entities/auth.entity';
import { MenuItem } from 'src/entities/menu-item.entity';
import { Balance } from 'src/entities/balance.entity';
import { OrdersGateway } from 'src/gateway/orders.gateway';

@Controller('orders')
export class OrderController {
  constructor(
    private orderService: OrderService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(MenuItem)
    private menuItemRepository: Repository<MenuItem>,
    @InjectRepository(Balance)
    private balanceRepository: Repository<Balance>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    private ordersGateway: OrdersGateway
  ) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async create(@Body() dto: CreateOrderDto): Promise<Order> {
    return this.orderService.createOrder(dto.tableId, dto.items, dto.nom, dto.email);
  }

  @Get()
  findAllOrders() {
    return this.orderService.findAllOrders();
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async cancelOrder(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    try {
      console.log(`Début de cancelOrder pour orderId: ${id}, userId: ${req.user?.sub}`);
      const user = await this.userRepository.findOne({ where: { id: req.user?.sub } });
      if (!user || user.role !== 'caissier') {
        throw new UnauthorizedException('Seul un caissier peut annuler une commande');
      }

      const order = await this.orderRepository.findOne({
        where: { id },
        relations: ['items', 'items.menuItem', 'payments', 'table', 'table.event'],
      });
      if (!order) {
        throw new NotFoundException('Commande non trouvée');
      }
      if (!order.table?.event) {
        throw new NotFoundException('Événement associé non trouvé');
      }

      // Marquer les paiements comme remboursés
      if (order.payments && order.payments.length > 0) {
        for (const payment of order.payments) {
          payment.status = 'refunded';
          await this.paymentRepository.save(payment);
        }
      }

      // Restaurer le stock des articles
      for (const orderItem of order.items || []) {
        if (!orderItem.menuItem) {
          throw new NotFoundException(`Article de menu non trouvé pour orderItem ${orderItem.id}`);
        }
        const menuItem = await this.menuItemRepository.findOne({ where: { id: orderItem.menuItem.id } });
        if (!menuItem) {
          throw new NotFoundException(`Article de menu non trouvé pour menuItemId ${orderItem.menuItem.id}`);
        }
        menuItem.stock += orderItem.quantity;
        await this.menuItemRepository.save(menuItem);
      }

      // Mettre à jour le solde
      if (order.paymentStatus === 'paid') {
        order.paymentStatus = 'refunded';
        order.refundedBy = user;
        order.refundDate = new Date();
        order.refundReason = 'Commande annulée';
        await this.orderRepository.save(order);

        const eventId = order.table.event.id;
        let balance = await this.balanceRepository.findOne({ where: { eventId } });
        if (balance) {
          balance.total -= order.total;
          balance.updatedAt = new Date();
          await this.balanceRepository.save(balance);
        }
      }

      // Émettre l'événement Socket.IO
      this.ordersGateway.handleOrderDeleted({ id });

      return { message: 'Commande annulée avec succès' };
    } catch (error) {
      console.error(`Erreur dans cancelOrder pour orderId: ${id}`, {
        message: error.message,
        stack: error.stack,
      });
      if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException(`Échec de l'annulation de la commande: ${error.message}`);
    }
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe())
  updateOrder(@Param('id', ParseIntPipe) id: number, @Body() body: CreateOrderDto) {
    return this.orderService.updateOrder(id, body.tableId, body.items);
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ValidationPipe())
  async updateOrderStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateOrderStatusDto,
    @Request() req: any,
  ): Promise<Order> {
    const userId = req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }
    return this.orderService.updateOrderStatus(id, body.status, req.user.email);
  }

  @Patch(':id/payment')
  @UseGuards(AuthGuard('jwt'))
  async validatePayment(@Param('id', ParseIntPipe) id: number, @Request() req: any): Promise<Order> {
    const userId = req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }
    return this.orderService.validatePayment(id, req.user.email);
  }

  @Get('balance/:eventId')
  @UseGuards(AuthGuard('jwt'))
  async getBalance(@Param('eventId', ParseIntPipe) eventId: number, @Request() req: any): Promise<number> {
    const userId = req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }
    return this.orderService.getBalance(eventId, userId);
  }

  @Get('payments/:eventId')
  @UseGuards(AuthGuard('jwt'))
  async getPaymentsByEvent(@Param('eventId', ParseIntPipe) eventId: number, @Request() req: any): Promise<Payment[]> {
    const userId = req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }
    return this.orderService.getPaymentsByEvent(eventId, userId);
  }

  @Get('table/:tableId')
  async findOrdersByTable(@Param('tableId', ParseIntPipe) tableId: number): Promise<(Order & { total: number })[]> {
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
    return this.orderService.findOrdersByEvent(eventId);
  }

  @Get('search')
  async findOrdersByNameOrEmail(@Query('search') search: string): Promise<(Order & { total: number })[]> {
    if (!search) {
      throw new BadRequestException('Requête de recherche requise');
    }
    const orders = await this.orderService.findOrdersByNameOrEmail(search);
    if (!orders || orders.length === 0) {
      throw new NotFoundException(`Aucune commande trouvée pour la requête : ${search}`);
    }
    return orders;
  }

  @Get('event-name')
  async findOrdersByEventName(@Query('eventName') eventName: string): Promise<(Order & { total: number })[]> {
    if (!eventName) {
      throw new BadRequestException('Nom de l\'événement requis');
    }
    const orders = await this.orderService.findOrdersByEventName(eventName);
    if (!orders || orders.length === 0) {
      throw new NotFoundException(`Aucune commande trouvée pour le nom de l'événement : ${eventName}`);
    }
    return orders;
  }

  @Get('refunded/:eventId')
  @UseGuards(AuthGuard('jwt'))
  async getRefundedOrders(@Param('eventId', ParseIntPipe) eventId: number, @Request() req: any): Promise<(Order & { total: number })[]> {
    const userId = req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }
    const user = await this.userRepository.findOne({ where: { id: userId } });
    console.log('Utilisateur pour getRefundedOrders:', { userId, role: user?.role });
    if (!user || user.role !== 'caissier') {
      throw new UnauthorizedException('Seul un caissier peut voir les commandes remboursées');
    }
    const orders = await this.orderService.getRefundedOrders(eventId, userId);
    return orders.map((order) => ({
      ...order,
    }));
  }

  @Patch(':id/refunded')
@UseGuards(AuthGuard('jwt'))
async markAsRefunded(
  @Param('id', ParseIntPipe) id: number,
  @Request() req: any
): Promise<{ message: string }> {
  try {
    console.log('Requête reçue pour markAsRefunded', {
      orderId: id,
      user: req.user,
      userId: req.user?.sub,
    });

    const user = await this.userRepository.findOne({ where: { id: req.user?.sub } });
    if (!user || user.role !== 'caissier') {
      throw new UnauthorizedException('Seul un caissier peut marquer une commande comme remboursée');
    }

    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items', 'items.menuItem', 'payments', 'table', 'table.event'],
    });
    if (!order) {
      throw new NotFoundException('Commande non trouvée');
    }
    if (order.paymentStatus === 'refunded') {
      throw new BadRequestException('La commande est déjà remboursée');
    }
    if (order.paymentStatus !== 'paid') {
      throw new BadRequestException('Seules les commandes payées peuvent être remboursées');
    }
    if (!order.table?.event) {
      throw new NotFoundException('Événement associé non trouvé');
    }

    // Mettre à jour le statut de paiement à "refunded"
    order.paymentStatus = 'refunded';
    order.refundDate = new Date();
    order.refundedBy = user;
    await this.orderRepository.save(order);

    // Restaurer le stock des articles
    for (const orderItem of order.items || []) {
      if (!orderItem.menuItem) {
        throw new NotFoundException(`Article de menu non trouvé pour orderItem ${orderItem.id}`);
      }
      const menuItem = await this.menuItemRepository.findOne({ where: { id: orderItem.menuItem.id } });
      if (!menuItem) {
        throw new NotFoundException(`Article de menu non trouvé pour menuItemId ${orderItem.menuItem.id}`);
      }
      menuItem.stock += orderItem.quantity;
      await this.menuItemRepository.save(menuItem);
    }

    // Mettre à jour le solde
    const eventId = order.table.event.id;
    let balance = await this.balanceRepository.findOne({ where: { eventId } });
    if (balance) {
      balance.total -= order.total;
      balance.updatedAt = new Date();
      await this.balanceRepository.save(balance);
    }

    // Marquer les paiements comme remboursés
    if (order.payments && order.payments.length > 0) {
      for (const payment of order.payments) {
        payment.status = 'refunded';
        await this.paymentRepository.save(payment);
      }
    }

    // Émettre l'événement Socket.IO
    this.ordersGateway.handleOrderRefunded({ id, paymentStatus: 'refunded' });

    return { message: 'Commande remboursée avec succès' };
  } catch (error) {
    console.error(`Erreur dans markAsRefunded pour orderId: ${id}`, {
      message: error.message,
      stack: error.stack,
    });
    if (error instanceof NotFoundException || error instanceof UnauthorizedException || error instanceof BadRequestException) {
      throw error;
    }
    throw new BadRequestException(`Échec du remboursement de la commande: ${error.message}`);
  }
}
}