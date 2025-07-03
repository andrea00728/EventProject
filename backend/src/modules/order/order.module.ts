import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from '../../services/order/order.service';
import { OrderController } from '../../controllers/order/order.controller';
import { Order } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { TableEvent } from '../../entities/Table';
import { MenuItem } from '../../entities/menu-item.entity';
import { Evenement } from '../../entities/Evenement';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, TableEvent, MenuItem, Evenement]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}