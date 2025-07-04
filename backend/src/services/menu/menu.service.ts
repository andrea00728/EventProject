import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from '../../entities/menu.entity';
import { MenuItem } from '../../entities/menu-item.entity';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Menu)
    private menuRepository: Repository<Menu>,
    @InjectRepository(MenuItem)
    private menuItemRepository: Repository<MenuItem>,
  ) {}

  async createMenu(name: string, eventId: number): Promise<Menu> {
    const menu = this.menuRepository.create({ name, event: { id: eventId } });
    return this.menuRepository.save(menu);
  }

  async addMenuItem(menuId: number, item: { name: string; description: string; price: number; category: string; stock: number }): Promise<MenuItem> {
    const menu = await this.menuRepository.findOne({ where: { id: menuId } });
    if (!menu) throw new NotFoundException('Menu not found');
    const menuItem = this.menuItemRepository.create({ ...item, menu });
    return this.menuItemRepository.save(menuItem);
  }

  async findMenuByEvent(eventId: number): Promise<Menu[]> {
    return this.menuRepository.find({ where: { event: { id: eventId } }, relations: ['items'] });
  }

  async findAllMenus(): Promise<Menu[]> {
    return this.menuRepository.find({ relations: ['items'] });
  }

  async getMenuItem(menuItemId: number): Promise<MenuItem> {
    const menuItem = await this.menuItemRepository.findOne({ where: { id: menuItemId } });
    if (!menuItem) throw new NotFoundException('Menu item not found');
    return menuItem;
  }

  async restockMenuItem(menuItemId: number, quantity: number): Promise<MenuItem> {
    const menuItem = await this.menuItemRepository.findOne({ where: { id: menuItemId } });
    if (!menuItem) throw new NotFoundException('Menu item not found');
    menuItem.stock += quantity;
    return this.menuItemRepository.save(menuItem);
  }
}