import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { TableEvent } from '../../entities/Table';
import { MenuItem } from '../../entities/menu-item.entity';
import { OrderService } from '../../services/order/order.service';
import { OrderController } from '../../controllers/order/order.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, TableEvent, MenuItem])],
  providers: [OrderService],
  controllers: [OrderController],
})
export class OrderModule {}