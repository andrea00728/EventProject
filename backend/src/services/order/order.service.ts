import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial, In, LessThanOrEqual } from 'typeorm';
import { Order } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { TableEvent } from '../../entities/Table';
import { MenuItem } from '../../entities/menu-item.entity';
import { Evenement } from '../../entities/Evenement';

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
    @InjectRepository(Evenement)
    private evenementRepository: Repository<Evenement>,
  ) {}

  async createOrder(tableId: number, items: { menuItemId: number; quantity: number }[], eventId: number, isClient: boolean = false): Promise<Order> {
    const table = await this.tableEventRepository.findOne({
      where: { id: tableId, event: { id: eventId } },
      relations: ['event'],
    });
    if (!table) {
      throw new NotFoundException('Table not found for this event');
    }

    const orderItemsData = await Promise.all(
      items.map(async (item) => {
        const menuItem = await this.menuItemRepository.findOne({
          where: { id: item.menuItemId, menu: { event: { id: eventId } } },
          relations: ['menu', 'menu.event'],
        });
        if (!menuItem) throw new NotFoundException(`Menu item ${item.menuItemId} not found`);
        if (menuItem.disabled) throw new BadRequestException(`Menu item ${menuItem.name} is disabled`);
        if (menuItem.stock < item.quantity) {
          throw new BadRequestException(`Insufficient stock for menu item ${menuItem.name}. Available: ${menuItem.stock}, Requested: ${item.quantity}`);
        }
        return { menuItem, subtotal: menuItem.price * item.quantity, quantity: item.quantity };
      }),
    );

    const order = this.orderRepository.create({
      table,
      orderDate: new Date(),
      status: 'PENDING',
      paymentStatus: 'non payé',
      total: orderItemsData.reduce((sum, item) => sum + Number(item.subtotal), 0),
    });
    const savedOrder = await this.orderRepository.save(order);

    const orderItems = await Promise.all(
      orderItemsData.map(async ({ menuItem, subtotal, quantity }) => {
        menuItem.stock -= quantity;
        await this.menuItemRepository.save(menuItem);
        return this.orderItemRepository.create({
          order: savedOrder,
          menuItem: menuItem as MenuItem,
          quantity,
          subtotal,
        } as DeepPartial<OrderItem>);
      }),
    );

    savedOrder.items = await this.orderItemRepository.save(orderItems);
    return this.orderRepository.save(savedOrder);
  }

  async updateOrderStatus(orderId: number, status: 'PENDING' | 'IN_PROGRESS' | 'READY', eventId: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, table: { event: { id: eventId } } },
      relations: ['table', 'table.event'],
    });
    if (!order) throw new NotFoundException('Order not found');
    order.status = status;
    return this.orderRepository.save(order);
  }

  async updatePaymentStatus(orderId: number, paymentStatus: 'payé' | 'non payé', eventId: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, table: { event: { id: eventId } } },
      relations: ['table', 'table.event'],
    });
    if (!order) throw new NotFoundException('Order not found');
    order.paymentStatus = paymentStatus;
    return this.orderRepository.save(order);
  }

  async updateOrderItems(orderId: number, items: { orderItemId: number; quantity: number }[], eventId: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, table: { event: { id: eventId } } },
      relations: ['items', 'items.menuItem', 'table', 'table.event'],
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.paymentStatus === 'payé') throw new BadRequestException('Cannot modify items of a paid order');

    for (const item of items) {
      const orderItem = order.items.find((oi) => oi.id === item.orderItemId);
      if (!orderItem) throw new NotFoundException(`Order item ${item.orderItemId} not found`);

      const menuItem = orderItem.menuItem;
      if (menuItem.disabled) throw new BadRequestException(`Menu item ${menuItem.name} is disabled`);
      const quantityDiff = item.quantity - orderItem.quantity;

      if (quantityDiff > 0 && menuItem.stock < quantityDiff) {
        throw new BadRequestException(`Insufficient stock for menu item ${menuItem.name}. Available: ${menuItem.stock}, Requested additional: ${quantityDiff}`);
      }

      menuItem.stock -= quantityDiff;
      orderItem.quantity = item.quantity;
      orderItem.subtotal = menuItem.price * item.quantity;

      await this.menuItemRepository.save(menuItem);
      await this.orderItemRepository.save(orderItem);
    }

    order.total = order.items.reduce((sum, item) => sum + Number(item.subtotal), 0);
    return this.orderRepository.save(order);
  }

  async findOrdersByTable(tableId: number, eventId: number): Promise<Order[]> {
    return this.orderRepository.find({
      where: { table: { id: tableId, event: { id: eventId } } },
      relations: ['items', 'items.menuItem', 'table', 'table.event'],
    });
  }

  async findOrdersForKitchen(eventId: number): Promise<{ id: number; items: { name: string; quantity: number }[]; status: string }[]> {
    const orders = await this.orderRepository.find({
      where: { status: In(['PENDING', 'IN_PROGRESS']), table: { event: { id: eventId } } },
      relations: ['items', 'items.menuItem', 'table', 'table.event'],
    });
    return orders.map((order) => ({
      id: order.id,
      items: order.items.map((item) => ({ name: item.menuItem.name, quantity: item.quantity })),
      status: order.status,
    }));
  }

  async getLowStockItems(eventId: number, threshold: number = 5): Promise<MenuItem[]> {
    return this.menuItemRepository.find({
      where: { stock: LessThanOrEqual(threshold), disabled: false, menu: { event: { id: eventId } } },
      relations: ['menu', 'menu.event'],
    });
  }

  async getOrderStats(eventId: number): Promise<{ totalSales: number; ordersByStatus: Record<string, number> }> {
    const orders = await this.orderRepository.find({
      where: { table: { event: { id: eventId } } },
      relations: ['table', 'table.event'],
    });
    const totalSales = orders.reduce((sum, order) => sum + Number(order.total), 0);
    const ordersByStatus = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return { totalSales, ordersByStatus };
  }

  async generateReceipt(orderId: number, eventId: number): Promise<string> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, table: { event: { id: eventId } } },
      relations: ['items', 'items.menuItem', 'table', 'table.event'],
    });
    if (!order) throw new NotFoundException('Order not found');
    const receipt = [
      `Receipt for Order #${order.id}`,
      `Date: ${order.orderDate.toISOString()}`,
      `Status: ${order.status}`,
      `Payment: ${order.paymentStatus}`,
      'Items:',
      ...order.items.map((item) => `${item.menuItem.name} x${item.quantity}: ${item.subtotal}`),
      `Total: ${order.total}`,
    ].join('\n');
    return receipt;
  }

  async cancelOrder(orderId: number, eventId: number): Promise<void> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, table: { event: { id: eventId } } },
      relations: ['items', 'items.menuItem', 'table', 'table.event'],
    });
    if (!order) throw new NotFoundException('Order not found');

    for (const orderItem of order.items) {
      const menuItem = orderItem.menuItem;
      menuItem.stock += orderItem.quantity;
      await this.menuItemRepository.save(menuItem);
    }

    await this.orderRepository.delete(orderId);
  }
}