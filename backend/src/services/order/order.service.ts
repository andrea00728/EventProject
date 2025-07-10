import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial, Like } from 'typeorm';
import { Order } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { TableEvent } from '../../entities/Table';
import { MenuItem } from '../../entities/menu-item.entity';
import { User } from 'src/Authentication/entities/auth.entity';
import { Balance } from 'src/entities/balance.entity';
import { Evenement } from 'src/entities/Evenement';
import { Payment } from 'src/entities/payment.entity';
import { Invite } from '../../entities/Invite';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(TableEvent)
    private tableEventRepository: Repository<TableEvent>,
    @InjectRepository(MenuItem)
    private menuItemRepository: Repository<MenuItem>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Balance)
    private balanceRepository: Repository<Balance>,
    @InjectRepository(Evenement)
    private eventRepository: Repository<Evenement>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Invite)
    private inviteRepository: Repository<Invite>,
  ) {}

  async createOrder(tableId: number, items: { menuItemId: number; quantity: number }[], nom?: string, email?: string): Promise<Order> {
    const table = await this.tableEventRepository.findOne({ where: { id: tableId }, relations: ['event'] });
    if (!table) throw new NotFoundException('Table not found');

    // let invite: Invite | undefined;
    // if (nom && email) {
    //   const eventId = table.event.id;
    //   const foundInvite = await this.inviteRepository.findOne({ where: { email, event: { id: eventId } } });
    //   if (foundInvite) {
    //     invite = foundInvite;
    //   } else {
    //     invite = this.inviteRepository.create({ nom, email, event: table.event, sex: 'M' }); // Default sex to 'M' if not provided
    //     await this.inviteRepository.save(invite);
    //   }
    // }

    for (const item of items) {
      const menuItem = await this.menuItemRepository.findOne({ where: { id: item.menuItemId } });
      if (!menuItem) throw new NotFoundException(`Menu item ${item.menuItemId} not found`);
      if (menuItem.stock < item.quantity) {
        throw new BadRequestException(`Insufficient stock for menu item ${menuItem.name}. Available: ${menuItem.stock}, Requested: ${item.quantity}`);
      }
    }

    const order = this.orderRepository.create({
      table,
      // invite,
      nom: nom,
      email: email,
      orderDate: new Date(),
      status: 'pending',
      paymentStatus: 'unpaid',
      total: 0,
    });
    const savedOrder = await this.orderRepository.save(order);

    const orderItems = await Promise.all(
      items.map(async (item) => {
        const menuItem = await this.menuItemRepository.findOne({ where: { id: item.menuItemId } });
        if (!menuItem) throw new NotFoundException(`Menu item ${item.menuItemId} not found`);
        const subtotal = menuItem.price * item.quantity;

        menuItem.stock -= item.quantity;
        await this.menuItemRepository.save(menuItem);

        return this.orderItemRepository.create({
          order: savedOrder,
          menuItem: menuItem as MenuItem,
          quantity: item.quantity,
          subtotal,
        } as DeepPartial<OrderItem>);
      }),
    );

    const total = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
    savedOrder.total = total;

    savedOrder.items = await this.orderItemRepository.save(orderItems);
    return this.orderRepository.save(savedOrder);
  }

  async findOrdersByTable(tableId: number): Promise<(Order & { total: number })[]> {
    const orders = await this.orderRepository.find({
      where: { table: { id: tableId } },
      relations: ['items', 'items.menuItem', 'invite'],
    });
    return orders.map((order) => ({
      ...order,
    }));
  }

  async cancelOrder(orderId: number): Promise<void> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'items.menuItem'],
    });
    if (!order) throw new NotFoundException('Order not found');

    for (const orderItem of order.items) {
      const menuItem = orderItem.menuItem;
      menuItem.stock += orderItem.quantity;
      await this.menuItemRepository.save(menuItem);
    }

    await this.orderRepository.delete(orderId);
  }

  async findAllOrders(): Promise<(Order)[]> {
    const orders = await this.orderRepository.find({
      relations: ['items', 'items.menuItem', 'invite'],
    });
    return orders.map((order) => ({
      ...order,
    }));
  }

  async updateOrder(orderId: number, tableId: number, items: { menuItemId: number; quantity: number }[]): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'items.menuItem', 'table'],
    });
    if (!order) throw new NotFoundException('Order not found');

    for (const orderItem of order.items) {
      const menuItem = orderItem.menuItem;
      if (menuItem) {
        menuItem.stock += orderItem.quantity;
        await this.menuItemRepository.save(menuItem);
      }
    }

    await this.orderItemRepository.delete({ order: { id: orderId } });

    for (const item of items) {
      const menuItem = await this.menuItemRepository.findOne({ where: { id: item.menuItemId } });
      if (!menuItem) throw new NotFoundException(`Menu item ${item.menuItemId} not found`);
      if (menuItem.stock < item.quantity) {
        throw new BadRequestException(
          `Stock insuffisant pour ${menuItem.name}. Disponible : ${menuItem.stock}, demandé : ${item.quantity}`,
        );
      }
    }

    const newOrderItems = await Promise.all(
      items.map(async (item) => {
        const menuItem = await this.menuItemRepository.findOne({ where: { id: item.menuItemId } });
        if (!menuItem) throw new NotFoundException(`Menu item ${item.menuItemId} not found`);

        menuItem.stock -= item.quantity;
        await this.menuItemRepository.save(menuItem);

        const subtotal = menuItem.price * item.quantity;

        return this.orderItemRepository.create({
          order,
          menuItem,
          quantity: item.quantity,
          subtotal,
        });
      }),
    );

    order.items = await this.orderItemRepository.save(newOrderItems);

    if (order.table.id !== tableId) {
      const newTable = await this.tableEventRepository.findOne({ where: { id: tableId } });
      if (!newTable) throw new NotFoundException('Table not found');
      order.table = newTable;
    }

    const total = newOrderItems.reduce((sum, item) => sum + item.subtotal, 0);
    order.total = total;

    return this.orderRepository.save(order);
  }

  async updateOrderStatus(orderId: number, status: 'pending' | 'preparing' | 'served', userId: string): Promise<Order> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || user.role !== 'cuisinier') {
      throw new UnauthorizedException('Only cuisinier can update order status');
    }
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'items.menuItem', 'table', 'invite', 'table.event'],
    });
    if (!order) throw new NotFoundException('Order not found');
    order.status = status;
    return this.orderRepository.save(order);
  }







  async validatePayment(orderId: number, userId: string): Promise<Order> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || user.role !== 'caissier') {
      throw new UnauthorizedException('Only caissier can validate payment');
    }
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'table', 'table.event', 'invite'],
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.paymentStatus === 'paid') {
      throw new BadRequestException('Order is already paid');
    }

    const total = order.total;
    const eventId = order.table.event.id;

    const payment = this.paymentRepository.create({
      order,
      orderId,
      user,
      userId,
      amount: total,
      event: order.table.event,
      eventId,
      paymentDate: new Date(),
    });
    await this.paymentRepository.save(payment);

    order.paymentStatus = 'paid';
    const savedOrder = await this.orderRepository.save(order);


    // Recalculer le solde à partir de toutes les commandes payées de cet événement
  const paidOrders = await this.orderRepository.find({
    where: {
      paymentStatus: 'paid',
      table: {
        event: { id: eventId }
      }
    },
    relations: ['table']
  });

  const updatedTotal = paidOrders.reduce((sum, ord) => sum + ord.total, 0);

  // Mettre à jour ou créer le solde
  let balance = await this.balanceRepository.findOne({ where: { eventId } });

  if (!balance) {
    balance = this.balanceRepository.create({
      total: updatedTotal,
      updatedAt: new Date(),
      event: order.table.event,
      eventId,
    });
  } else {
    balance.total = updatedTotal;
    balance.updatedAt = new Date();
  }

  await this.balanceRepository.save(balance);


    

    const existingOrder = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'items.menuItem', 'table', 'invite', 'table.event', 'payments'],
    });
    if (!existingOrder) {
      throw new NotFoundException('Order not found');
    }
    return existingOrder;
  }









  async getBalance(eventId: number, userId: string): Promise<number> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || user.role !== 'caissier') {
      throw new UnauthorizedException('Only caissier can view balance');
    }
    const balance = await this.balanceRepository.findOne({ where: { eventId } });
    return balance ? balance.total : 0;
  }







  async getPaymentsByEvent(eventId: number, userId: string): Promise<Payment[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || user.role !== 'caissier') {
      throw new UnauthorizedException('Only caissier can view payments');
    }
    return this.paymentRepository.find({
      where: { eventId },
      relations: ['order', 'order.items', 'order.items.menuItem', 'order.invite', 'user'],
    });
  }

  async findById(id: number) {
    return await this.orderRepository.findOne({
      where: { id },
      relations: ['table', 'invite', 'items', 'items.menuItem'],
    });
  }


  async findOrdersByEvent(eventId: number): Promise<(Order & { total: number })[]> {
    const orders = await this.orderRepository.find({
      where: { table: { event: { id: eventId } } },
      relations: ['items', 'items.menuItem', 'invite', 'table', 'table.event'],
    });
    return orders.map((order) => ({
      ...order,
    }));
  }




  async findOrdersByNameOrEmail(search: string): Promise<(Order & { total: number })[]> {
    const orders = await this.orderRepository.find({
      where: [
        { nom: Like(`%${search}%`) },
        { email: Like(`%${search}%`) },
      ],
      relations: ['items', 'items.menuItem', 'invite', 'table', 'table.event'],
    });
    return orders.map((order) => ({
      ...order,
    }));
  }


  async findOrdersByEventName(eventName: string): Promise<(Order & { total: number })[]> {
    const orders = await this.orderRepository.find({
      where: { table: { event: { nom: Like(`%${eventName}%`) } } },
      relations: ['items', 'items.menuItem', 'invite', 'table', 'table.event'],
    });
    return orders.map((order) => ({
      ...order,
    }));
  }
}