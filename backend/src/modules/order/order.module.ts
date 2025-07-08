import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from 'src/services/order/order.service';
import { OrderController } from 'src/controllers/order/order.controller';
import { Order } from 'src/entities/order.entity';
import { OrderItem } from 'src/entities/order-item.entity';
import { TableEvent } from 'src/entities/Table';
import { MenuItem } from 'src/entities/menu-item.entity';
import { AuthModule } from 'src/Authentication/auth.module';
import { User } from 'src/Authentication/entities/auth.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, TableEvent, MenuItem, User]),
    AuthModule, // Import AuthModule to access UserRepository
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}