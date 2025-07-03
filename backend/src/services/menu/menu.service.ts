import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
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

  async addMenuItem(menuId: number, data: { name: string; description: string; price: number; category: string; stock: number; stockThreshold?: number; eventId: number }): Promise<MenuItem> {
    const menu = await this.menuRepository.findOne({ where: { id: menuId, event: { id: data.eventId } } });
    if (!menu) throw new NotFoundException('Menu not found');
    const menuItem = this.menuItemRepository.create({ ...data, menu });
    return this.menuItemRepository.save(menuItem);
  }

  async updateMenuItem(menuId: number, itemId: number, data: { name?: string; description?: string; price?: number; category?: string; stock?: number; disabled?: boolean; stockThreshold?: number; eventId: number }): Promise<MenuItem> {
    const menuItem = await this.menuItemRepository.findOne({ where: { id: itemId, menu: { id: menuId, event: { id: data.eventId } } } });
    if (!menuItem) throw new NotFoundException('Menu item not found');
    Object.assign(menuItem, data);
    return this.menuItemRepository.save(menuItem);
  }

  async deleteMenuItem(menuId: number, itemId: number, eventId: number): Promise<void> {
    const menuItem = await this.menuItemRepository.findOne({ where: { id: itemId, menu: { id: menuId, event: { id: eventId } } } });
    if (!menuItem) throw new NotFoundException('Menu item not found');
    await this.menuItemRepository.delete(itemId);
  }

  async getPublicMenu(eventId: number): Promise<MenuItem[]> {
    return this.menuItemRepository.find({ where: { disabled: false, stock: MoreThan(0), menu: { event: { id: eventId } } } });
  }
}