import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Order } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { TableEvent } from '../../entities/Table';
import { MenuItem } from '../../entities/menu-item.entity';
import { User } from 'src/Authentication/entities/auth.entity';
import { Balance } from 'src/entities/balance.entity';
import { Evenement } from 'src/entities/Evenement';
import { Payment } from 'src/entities/payment.entity';

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
  ) {}

  async createOrder(tableId: number, items: { menuItemId: number; quantity: number }[], userId?: string,): Promise<Order> {
    const table = await this.tableEventRepository.findOne({ where: { id: tableId } });
    if (!table) throw new NotFoundException('Table not found');


    // Vérifier l'utilisateur si userId est fourni
    let user: User | undefined;
    if (userId) {
      const foundUser = await this.userRepository.findOne({ where: { id: userId } });
      user = foundUser !== null ? foundUser : undefined;
      if (!user) throw new NotFoundException(`User with ID ${userId} not found`);
      if (!['organisateur', 'accueil'].includes(user.role)) {
        throw new BadRequestException('Only users with role "organisateur" or "accueil" can create orders');
      }
    }

    // Vérifier la disponibilité du stock
    for (const item of items) {
      const menuItem = await this.menuItemRepository.findOne({ where: { id: item.menuItemId } });
      if (!menuItem) throw new NotFoundException(`Menu item ${item.menuItemId} not found`);
      if (menuItem.stock < item.quantity) {
        throw new BadRequestException(`Insufficient stock for menu item ${menuItem.name}. Available: ${menuItem.stock}, Requested: ${item.quantity}`);
      }
    }

    // Créer la commande
    const order = this.orderRepository.create({ table, user, orderDate: new Date(), status: 'pending', paymentStatus: 'unpaid', total: 0,});
    const savedOrder = await this.orderRepository.save(order);

    const orderItems = await Promise.all(
      items.map(async (item) => {
        const menuItem = await this.menuItemRepository.findOne({ where: { id: item.menuItemId }});
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

  const total = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
  savedOrder.total = total;

    savedOrder.items = await this.orderItemRepository.save(orderItems);
    return this.orderRepository.save(savedOrder);
  }






  async findOrdersByTable(tableId: number): Promise<(Order & { total: number })[]> {
    const orders = await this.orderRepository.find({ where: { table: { id: tableId } }, relations: ['items', 'items.menuItem', 'user'] });
    return orders.map((order) => {
      return { ...order};
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






  async findAllOrders(): Promise<(Order)[]> {
    const orders = await this.orderRepository.find({ relations: ['items', 'items.menuItem', 'user'] });
    return orders.map((order) => {
      return { ...order};
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
      relations: ['items', 'items.menuItem', 'table'],
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


        const subtotal = menuItem.price * item.quantity;
  
        return this.orderItemRepository.create({
          order,
          menuItem,
          quantity: item.quantity,
          subtotal,
        });
      })
    );
  
    // 6. Réassocier les nouveaux items à la commande
    order.items = await this.orderItemRepository.save(newOrderItems);
  
    // 7. Mettre à jour la table si nécessaire
    if (order.table.id !== tableId) { // ✅ AJOUTÉ : évite requête inutile
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
      relations: ['items', 'items.menuItem', 'table', 'user', 'table.event'],
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
      relations: ['items', 'table', 'table.event'],
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.paymentStatus === 'paid') {
      throw new BadRequestException('Order is already paid');
    }

    const total = order.items.reduce((sum, item) => sum + item.subtotal, 0);
    const eventId = order.table.event.id;

    // Create Payment record
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

    // Update paymentStatus
    order.paymentStatus = 'paid';
    const savedOrder = await this.orderRepository.save(order);

    // Update event-specific balance
    let balance = await this.balanceRepository.findOne({ where: { eventId } });
    if (!balance) {
      balance = this.balanceRepository.create({
        total,
        updatedAt: new Date(),
        event: order.table.event,
        eventId,
      });
    } else {
      balance.total += total;
      balance.updatedAt = new Date();
    }
    await this.balanceRepository.save(balance);

    

    const existingOrder = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'items.menuItem', 'table', 'user', 'table.event', 'payments'],
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
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
      relations: ['order', 'order.items', 'order.items.menuItem', 'user'],
    });
  }





  // src/services/order/order.service.ts
async findById(id: number) {
  return await this.orderRepository.findOne({
    where: { id },
    relations: ['table', 'user', 'items', 'items.menuItem'], // ajuste selon tes relations
  });
}


}

