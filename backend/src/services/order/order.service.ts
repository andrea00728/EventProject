import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
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
import { Personnel } from 'src/entities/Personnel';
import { OrdersGateway } from 'src/gateway/orders.gateway';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private ordersGateway: OrdersGateway,
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
    @InjectRepository(Personnel)
    private personnelRepository: Repository<Personnel>,
    
    
  ) {}

  async createOrder(tableId: number, items: { menuItemId: number; quantity: number }[], nom?: string, email?: string): Promise<Order> {
  console.log(`Création d'une commande pour tableId: ${tableId}`);
  const table = await this.tableEventRepository.findOne({ where: { id: tableId }, relations: ['event'] });
  if (!table) {
    console.error(`Tableau non trouvé pour tableId: ${tableId}`);
    throw new NotFoundException('Tableau non trouvé');
  }

  // Vérifier le stock avant de créer la commande
  for (const item of items) {
    const menuItem = await this.menuItemRepository.findOne({ where: { id: item.menuItemId } });
    if (!menuItem) {
      console.error(`Article de menu non trouvé pour menuItemId: ${item.menuItemId}`);
      throw new NotFoundException(`Article de menu ${item.menuItemId} non trouvé`);
    }
    if (menuItem.stock < item.quantity) {
      console.error(`Stock insuffisant pour ${menuItem.name}. Disponible: ${menuItem.stock}, Demandé: ${item.quantity}`);
      throw new BadRequestException(`Stock insuffisant pour ${menuItem.name}. Disponible: ${menuItem.stock}, Demandé: ${item.quantity}`);
    }
  }

  const order = this.orderRepository.create({
    table,
    nom: nom || 'Client invité',
    email: email,
    orderDate: new Date(),
    status: 'pending',
    paymentStatus: 'unpaid',
    total: 0,
  });
  const savedOrder = await this.orderRepository.save(order);
  console.log(`Commande créée avec ID: ${savedOrder.id}`);

  const orderItems = await Promise.all(
    items.map(async (item) => {
      const menuItem = await this.menuItemRepository.findOne({ where: { id: item.menuItemId } });
      if (!menuItem) throw new NotFoundException(`Article de menu ${item.menuItemId} non trouvé`);
      const subtotal = menuItem.price * item.quantity;

      // Mettre à jour le stock - C'EST ICI QUE LE STOCK DIMINUE
      menuItem.stock -= item.quantity;
      await this.menuItemRepository.save(menuItem);
      console.log(`Stock mis à jour pour menuItemId: ${menuItem.id}, nouveau stock: ${menuItem.stock}`);

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
  const finalOrder = await this.orderRepository.save(savedOrder);
  this.ordersGateway.notifyNewOrder(finalOrder);
  return finalOrder;
}

  async findOrdersByTable(tableId: number): Promise<(Order & { total: number })[]> {
    console.log(`Recherche des commandes pour tableId: ${tableId}`);
    const orders = await this.orderRepository.find({
      where: { table: { id: tableId } },
      relations: ['items', 'items.menuItem'],
    });
    return orders.map((order) => ({
      ...order,
    }));
  }

  async cancelOrder(orderId: number, userId: string): Promise<{ message: string }> {
    try {
      console.log(`Début de cancelOrder pour orderId: ${orderId}, userId: ${userId}`);
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user || user.role !== 'caissier') {
        console.error(`Accès non autorisé pour userId: ${userId}`);
        throw new UnauthorizedException('Seul un caissier peut annuler une commande');
      }

      const order = await this.orderRepository.findOne({
        where: { id: orderId },
        relations: ['items', 'items.menuItem', 'payments', 'table', 'table.event'],
      });
      if (!order) {
        console.log(`Commande non trouvée pour orderId: ${orderId}`);
        throw new NotFoundException('Commande non trouvée');
      }
      console.log(`Commande trouvée: ${JSON.stringify(order, null, 2)}`);

      // Supprimer les paiements associés
      if (order.payments && order.payments.length > 0) {
        console.log(`Suppression des paiements pour orderId: ${orderId}`);
        await this.paymentRepository.delete({ orderId });
        console.log(`Paiements supprimés pour orderId: ${orderId}`);
      }

      // Restaurer le stock des articles
      if (order.items && order.items.length > 0) {
        for (const orderItem of order.items) {
          if (!orderItem.menuItem) {
            console.error(`MenuItem manquant pour orderItem: ${orderItem.id}`);
            throw new NotFoundException(`Article de menu non trouvé pour orderItem ${orderItem.id}`);
          }
          const menuItem = await this.menuItemRepository.findOne({ where: { id: orderItem.menuItem.id } });
          if (!menuItem) {
            console.error(`MenuItem non trouvé pour menuItemId: ${orderItem.menuItem.id}`);
            throw new NotFoundException(`Article de menu non trouvé pour menuItemId ${orderItem.menuItem.id}`);
          }
          menuItem.stock += orderItem.quantity;
          console.log(`Mise à jour du stock pour menuItem: ${menuItem.id}, nouveau stock: ${menuItem.stock}`);
          await this.menuItemRepository.save(menuItem);
        }
      } else {
        console.warn(`Aucun article trouvé pour orderId: ${orderId}`);
      }

      // Mettre à jour le solde si la commande était payée
      if (order.paymentStatus === 'paid' && order.table?.event) {
        const eventId = order.table.event.id;
        const paidOrders = await this.orderRepository.find({
          where: {
            paymentStatus: 'paid',
            table: { event: { id: eventId } },
          },
          relations: ['table'],
        });
        const updatedTotal = paidOrders
          .filter((ord) => ord.id !== orderId)
          .reduce((sum, ord) => sum + ord.total, 0);

        let balance = await this.balanceRepository.findOne({ where: { eventId } });
        if (balance) {
          balance.total = updatedTotal;
          balance.updatedAt = new Date();
          await this.balanceRepository.save(balance);
          console.log(`Solde mis à jour pour eventId: ${eventId}, total: ${updatedTotal}`);
        }
      }

      // Supprimer la commande
      console.log(`Suppression de la commande: ${orderId}`);
      await this.orderRepository.delete(orderId);
      console.log(`Commande supprimée avec succès: ${orderId}`);

      // Émettre l'événement Socket.IO
      this.ordersGateway.handleOrderDeleted({ id: orderId });

      return { message: 'Commande annulée et supprimée avec succès' };
    } catch (error) {
      console.error(`Erreur dans cancelOrder pour orderId: ${orderId}`, {
        message: error.message,
        stack: error.stack,
      });
      if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException(`Échec de l'annulation de la commande: ${error.message}`);
    }
  }

  async findAllOrders(): Promise<(Order)[]> {
    console.log('Recherche de toutes les commandes');
    const orders = await this.orderRepository.find({
      relations: ['items', 'items.menuItem'],
    });
    return orders.map((order) => ({
      ...order,
    }));
  }

  async updateOrder(orderId: number, tableId: number, items: { menuItemId: number; quantity: number }[]): Promise<Order> {
    console.log(`Mise à jour de la commande orderId: ${orderId}`);
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'items.menuItem', 'table'],
    });
    if (!order) {
      console.error(`Commande non trouvée pour orderId: ${orderId}`);
      throw new NotFoundException('Commande non trouvée');
    }

    for (const orderItem of order.items) {
      const menuItem = orderItem.menuItem;
      if (menuItem) {
        menuItem.stock += orderItem.quantity;
        await this.menuItemRepository.save(menuItem);
        console.log(`Stock restauré pour menuItemId: ${menuItem.id}, nouveau stock: ${menuItem.stock}`);
      }
    }

    await this.orderItemRepository.delete({ order: { id: orderId } });

    for (const item of items) {
      const menuItem = await this.menuItemRepository.findOne({ where: { id: item.menuItemId } });
      if (!menuItem) {
        console.error(`Article de menu non trouvé pour menuItemId: ${item.menuItemId}`);
        throw new NotFoundException(`Article de menu ${item.menuItemId} non trouvé`);
      }
      if (menuItem.stock < item.quantity) {
        console.error(`Stock insuffisant pour ${menuItem.name}. Disponible: ${menuItem.stock}, Demandé: ${item.quantity}`);
        throw new BadRequestException(
          `Stock insuffisant pour ${menuItem.name}. Disponible: ${menuItem.stock}, Demandé: ${item.quantity}`,
        );
      }
    }

    const newOrderItems = await Promise.all(
      items.map(async (item) => {
        const menuItem = await this.menuItemRepository.findOne({ where: { id: item.menuItemId } });
        if (!menuItem) throw new NotFoundException(`Article de menu ${item.menuItemId} non trouvé`);

        menuItem.stock -= item.quantity;
        await this.menuItemRepository.save(menuItem);
        console.log(`Stock mis à jour pour menuItemId: ${menuItem.id}, nouveau stock: ${menuItem.stock}`);

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
      if (!newTable) {
        console.error(`Tableau non trouvé pour tableId: ${tableId}`);
        throw new NotFoundException('Tableau non trouvé');
      }
      order.table = newTable;
    }

    const total = newOrderItems.reduce((sum, item) => sum + item.subtotal, 0);
    order.total = total;

    console.log(`Commande mise à jour pour orderId: ${orderId}`);
    return this.orderRepository.save(order);
  }

  async updateOrderStatus(orderId: number, status: 'pending' | 'preparing' | 'served' | 'canceled', email: string): Promise<Order> {
    console.log(`Mise à jour du statut pour orderId: ${orderId}, status: ${status}`);
    const user = await this.personnelRepository.findOne({ where: { email: email } });
    if (!user || !['cuisinier', 'caissier'].includes(user.role)) {
      console.error(`Accès non autorisé pour email: ${email}, rôle: ${user?.role}`);
      throw new UnauthorizedException('Seul un cuisinier ou un caissier peut mettre à jour le statut de la commande');
    }
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'items.menuItem', 'table', 'table.event'],
    });

    if (!order) {
      console.error(`Commande non trouvée pour orderId: ${orderId}`);
      throw new NotFoundException('Commande non trouvée');
    }
    order.status = status;
    console.log(`Statut mis à jour pour orderId: ${orderId}, nouveau statut: ${status}`);
    
    // Émettre un événement WebSocket pour notifier les clients
    this.ordersGateway.handleStatusUpdate({ id: orderId, status });
    
    return this.orderRepository.save(order);
  }

  async validatePayment(orderId: number, email: string): Promise<Order> {
    console.log(`Validation du paiement pour orderId: ${orderId}, email: ${email}`);
    const personnel = await this.personnelRepository.findOne({ where: { email: email } });
    if (!personnel || personnel.role !== 'caissier') {
      console.error(`Accès non autorisé pour email: ${email}`);
      throw new UnauthorizedException('Seul un caissier peut valider un paiement');
    }

    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'table', 'table.event'],
    });
    if (!order) {
      console.error(`Commande non trouvée pour orderId: ${orderId}`);
      throw new NotFoundException('Commande non trouvée');
    }
    if (order.paymentStatus === 'paid') {
      console.error(`Commande déjà payée pour orderId: ${orderId}`);
      throw new BadRequestException('La commande est déjà payée');
    }

    const total = order.total;
    const eventId = order.table.event.id;

    const payment = this.paymentRepository.create({
      order,
      orderId,
      personnel,
      amount: total,
      event: order.table.event,
      eventId,
      paymentDate: Date(),
    });
    await this.paymentRepository.save(payment);
    console.log(`Paiement enregistré pour orderId: ${orderId}`);

    order.paymentStatus = 'paid';
    const savedOrder = await this.orderRepository.save(order);
    console.log(`Statut de paiement mis à jour pour orderId: ${orderId}, statut: paid`);

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
    console.log(`Solde mis à jour pour eventId: ${eventId}, total: ${updatedTotal}`);

    const existingOrder = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'items.menuItem', 'table', 'table.event', 'payments'],
    });
    if (!existingOrder) {
      console.error(`Commande non trouvée après mise à jour pour orderId: ${orderId}`);
      throw new NotFoundException('Commande non trouvée');
    }
    return existingOrder;
  }

  async getBalance(eventId: number, userId: string): Promise<number> {
    console.log(`Récupération du solde pour eventId: ${eventId}, userId: ${userId}`);
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || user.role !== 'caissier') {
      console.error(`Accès non autorisé pour userId: ${userId}`);
      throw new UnauthorizedException('Seul un caissier peut voir le solde');
    }
    const balance = await this.balanceRepository.findOne({ where: { eventId } });
    return balance ? balance.total : 0;
  }

  async getPaymentsByEvent(eventId: number, userId: string): Promise<Payment[]> {
    console.log(`Récupération des paiements pour eventId: ${eventId}, userId: ${userId}`);
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || user.role !== 'caissier') {
      console.error(`Accès non autorisé pour userId: ${userId}`);
      throw new UnauthorizedException('Seul un caissier peut voir les paiements');
    }
    return this.paymentRepository.find({
      where: { eventId },
      relations: ['order', 'order.items', 'order.items.menuItem', 'order.invite', 'user'],
    });
  }

  async findById(id: number) {
    console.log(`Recherche de la commande par id: ${id}`);
    return await this.orderRepository.findOne({
      where: { id },
      relations: ['table', 'items', 'items.menuItem'],
    });
  }

  async findOrdersByEvent(eventId: number): Promise<(Order & { total: number })[]> {
    console.log(`Recherche des commandes pour eventId: ${eventId}`);
    const orders = await this.orderRepository.find({
      where: { table: { event: { id: eventId } } },
      relations: ['items', 'items.menuItem', 'table', 'table.event'],
      order: { id: 'ASC' },
    });
    return orders.map((order) => ({
      ...order,
    }));
  }

  async findOrdersByNameOrEmail(search: string): Promise<(Order & { total: number })[]> {
    console.log(`Recherche des commandes par nom ou email: ${search}`);
    const orders = await this.orderRepository.find({
      where: [
        { nom: Like(`%${search}%`) },
        { email: Like(`%${search}%`) },
      ],
      relations: ['items', 'items.menuItem', 'table', 'table.event'],
    });
    return orders.map((order) => ({
      ...order,
    }));
  }

  async findOrdersByEventName(eventName: string): Promise<(Order & { total: number })[]> {
    console.log(`Recherche des commandes par nom d'événement: ${eventName}`);
    const orders = await this.orderRepository.find({
      where: { table: { event: { nom: Like(`%${eventName}%`) } } },
      relations: ['items', 'items.menuItem', 'table', 'table.event'],
    });
    return orders.map((order) => ({
      ...order,
    }));
  }

  async getRefundedOrders(eventId: number, userId: string): Promise<(Order & { total: number })[]> {
    console.log(`Recherche des commandes remboursées pour eventId: ${eventId}, userId: ${userId}`);
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || user.role !== 'caissier') {
      throw new UnauthorizedException('Seul un caissier peut voir les commandes remboursées');
    }
    const orders = await this.orderRepository.find({
      where: { table: { event: { id: eventId } }, paymentStatus: 'refunded' },
      relations: ['items', 'items.menuItem', 'table', 'table.event'],
    });
    if (!orders || orders.length === 0) {
      throw new NotFoundException(`Aucune commande remboursée trouvée pour l'événement avec l'id ${eventId}`);
    }
    return orders.map((order) => ({
      ...order,
    }));
  }
}