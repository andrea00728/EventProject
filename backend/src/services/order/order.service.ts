import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Order } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { TableEvent } from '../../entities/Table';
import { MenuItem } from '../../entities/menu-item.entity';
import { CreateOrderItemDto } from 'src/dto/order.dto';

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

    // Vérifier la disponibilité du stock
    for (const item of items) {
      const menuItem = await this.menuItemRepository.findOne({ where: { id: item.menuItemId } });
      if (!menuItem) throw new NotFoundException(`Menu item ${item.menuItemId} not found`);
      if (menuItem.stock < item.quantity) {
        throw new BadRequestException(`Insufficient stock for menu item ${menuItem.name}. Available: ${menuItem.stock}, Requested: ${item.quantity}`);
      }
    }

    // Créer la commande
    const order = this.orderRepository.create({ table, orderDate: new Date(), status: 'pending' });
    const savedOrder = await this.orderRepository.save(order);

    const orderItems = await Promise.all(
      items.map(async (item) => {
        const menuItem = await this.menuItemRepository.findOne({ where: { id: item.menuItemId } });
        if (!menuItem) throw new NotFoundException(`Menu item ${item.menuItemId} not found`);
        const subtotal = menuItem.price * item.quantity;

        // Réduire le stock
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
    return this.orderRepository.save(savedOrder);
  }

  async updateOrderStatus(orderId: number, status: 'pending' | 'preparing' | 'served' | 'paid'): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    order.status = status;
    return this.orderRepository.save(order);
  }

  async findOrdersByTable(tableId: number): Promise<(Order & { total: number })[]> {
    const orders = await this.orderRepository.find({ where: { table: { id: tableId } }, relations: ['items', 'items.menuItem'] });
    return orders.map((order) => {
      const total = order.items.reduce((sum, item) => sum + item.subtotal, 0);
      return { ...order, total };
    });
  }

  async cancelOrder(orderId: number): Promise<void> {
    const order = await this.orderRepository.findOne({ where: { id: orderId }, relations: ['items', 'items.menuItem'] });
    if (!order) throw new NotFoundException('Order not found');

    // Restaurer le stock
    for (const orderItem of order.items) {
      const menuItem = orderItem.menuItem;
      menuItem.stock += orderItem.quantity;
      await this.menuItemRepository.save(menuItem);
    }

    // Supprimer la commande
    await this.orderRepository.delete(orderId);
  }

  async findAllOrders(): Promise<(Order & { total: number })[]> {
    const orders = await this.orderRepository.find({ relations: ['items', 'items.menuItem'] });
    return orders.map((order) => {
      const total = order.items.reduce((sum, item) => sum + item.subtotal, 0);
      return { ...order, total };
    });
  }

  async updateOrder(
    orderId: number,
    tableId: number,
    items: { menuItemId: number; quantity: number }[]
  ): Promise<Order> {
    // 1. Récupérer la commande avec les relations
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'items.menuItem'],
    });
    if (!order) throw new NotFoundException('Order not found');
  
    // 2. Restaurer le stock des anciens items
    for (const orderItem of order.items) {
      const menuItem = orderItem.menuItem;
      if (menuItem) {
        menuItem.stock += orderItem.quantity;
        await this.menuItemRepository.save(menuItem);
      }
    }
  
    // 3. Supprimer les anciens order items
    await this.orderItemRepository.delete({ order: { id: orderId } });
  
    // 4. Vérifier disponibilité du stock pour les nouveaux items
    for (const item of items) {
      const menuItem = await this.menuItemRepository.findOne({ where: { id: item.menuItemId } });
      if (!menuItem) throw new NotFoundException(`Menu item ${item.menuItemId} not found`);
      if (menuItem.stock < item.quantity) {
        throw new BadRequestException(
          `Stock insuffisant pour ${menuItem.name}. Disponible : ${menuItem.stock}, demandé : ${item.quantity}`
        );
      }
    }
  
    // 5. Créer les nouveaux order items et ajuster le stock
    const newOrderItems = await Promise.all(
      items.map(async (item) => {
        const menuItem = await this.menuItemRepository.findOne({ where: { id: item.menuItemId } });
        if (!menuItem) throw new NotFoundException(`Menu item ${item.menuItemId} not found`);
  
        menuItem.stock -= item.quantity;
        await this.menuItemRepository.save(menuItem);
  
        return this.orderItemRepository.create({
          order,
          menuItem,
          quantity: item.quantity,
          subtotal: menuItem.price * item.quantity,
        });
      })
    );
  
    // 6. Réassocier les nouveaux items à la commande
    order.items = await this.orderItemRepository.save(newOrderItems);
  
    // 7. Mettre à jour la table si nécessaire
    const newTable = await this.tableEventRepository.findOne({ where: { id: tableId } });
    if (!newTable) throw new NotFoundException('Table not found');
    order.table = newTable;
  
    return this.orderRepository.save(order);
  }
  
}