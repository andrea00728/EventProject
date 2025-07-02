import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Order } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { TableEvent } from '../../entities/Table';
import { MenuItem } from '../../entities/menu-item.entity';

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
  ) {}

  async createOrder(tableId: number, items: { menuItemId: number; quantity: number }[]): Promise<Order> {
    const table = await this.tableEventRepository.findOne({ where: { id: tableId } });
    if (!table) throw new NotFoundException('Table not found');

    for (const item of items) {
      const menuItem = await this.menuItemRepository.findOne({ where: { id: item.menuItemId } });
      if (!menuItem) throw new NotFoundException(`Menu item ${item.menuItemId} not found`);
      if (menuItem.stock < item.quantity) {
        throw new BadRequestException(`Insufficient stock for menu item ${menuItem.name}. Available: ${menuItem.stock}, Requested: ${item.quantity}`);
      }
    }

    const order = this.orderRepository.create({ table, orderDate: new Date(), status: 'pending', paymentStatus: 'non payé', total: 0 });
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

    savedOrder.items = await this.orderItemRepository.save(orderItems);
    savedOrder.total = orderItems.reduce((sum, item) => sum + Number(item.subtotal), 0);
    return this.orderRepository.save(savedOrder);
  }

  async updateOrderStatus(orderId: number, status: 'pending' | 'preparing' | 'served'): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    order.status = status;
    return this.orderRepository.save(order);
  }

  async updatePaymentStatus(orderId: number, paymentStatus: 'payé' | 'non payé'): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    order.paymentStatus = paymentStatus;
    return this.orderRepository.save(order);
  }

  async updateOrderItems(orderId: number, items: { orderItemId: number; quantity: number }[]): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id: orderId }, relations: ['items', 'items.menuItem'] });
    if (!order) throw new NotFoundException('Order not found');
    if (order.paymentStatus === 'payé') throw new BadRequestException('Cannot modify items of a paid order');

    for (const item of items) {
      const orderItem = order.items.find((oi) => oi.id === item.orderItemId);
      if (!orderItem) throw new NotFoundException(`Order item ${item.orderItemId} not found`);

      const menuItem = orderItem.menuItem;
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

  async findOrdersByTable(tableId: number): Promise<Order[]> {
    const orders = await this.orderRepository.find({ where: { table: { id: tableId } }, relations: ['items', 'items.menuItem'] });
    return orders;
  }

  async cancelOrder(orderId: number): Promise<void> {
    const order = await this.orderRepository.findOne({ where: { id: orderId }, relations: ['items', 'items.menuItem'] });
    if (!order) throw new NotFoundException('Order not found');

    for (const orderItem of order.items) {
      const menuItem = orderItem.menuItem;
      menuItem.stock += orderItem.quantity;
      await this.menuItemRepository.save(menuItem);
    }

    await this.orderRepository.delete(orderId);
  }
}