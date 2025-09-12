import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from '../../entities/menu.entity';
import { MenuItem } from '../../entities/menu-item.entity';
import { CreateMenuItemDto } from 'src/dto/menu.dto';
import { join } from 'path';
import { unlink } from 'fs';


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

  async addMenuItem(
    menuId: number,
    item: { name: string; description: string; price: number; category: string; stock: number },
    photoPath?: string
  ): Promise<MenuItem> {
    const menu = await this.menuRepository.findOne({ where: { id: menuId } });
    if (!menu) throw new NotFoundException('Menu not found');
  
    const menuItem = this.menuItemRepository.create({ ...item, menu, photo: photoPath });
    return this.menuItemRepository.save(menuItem);
  }

  async findMenuByEvent(eventId: number): Promise<Menu[]> {
    return this.menuRepository.find({ where: { event: { id: eventId } }, relations: ['items', 'event'] });
  }

  async findAllMenus(): Promise<Menu[]> {
    return this.menuRepository.find({ relations: ['items','event'] });
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

  async deletePhoto(photoPath: string): Promise<void> {
    if (!photoPath) return;

    // Normalise : supprime le / initial si présent
    const relativePath = photoPath.startsWith('/') ? photoPath.slice(1) : photoPath;

    const filePath = join(process.cwd(), relativePath);
    try {
      await new Promise<void>((resolve, reject) => {
        unlink(filePath, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    } catch (err) {
      console.warn('Erreur lors de la suppression du fichier image :', err.message);
    }
  }

  async updateMenuItem(
    menuItemId: number,
    updatedFields: Partial<{ name: string; description: string; price: number; category: string; stock: number }>,
    photoPath?: string,
  ): Promise<MenuItem> {
    const menuItem = await this.menuItemRepository.findOne({ where: { id: menuItemId } });
    if (!menuItem) throw new NotFoundException('Menu item not found');
  
    Object.assign(menuItem, updatedFields);
  
    if (photoPath) {
      if (menuItem.photo) {
        await this.deletePhoto(menuItem.photo);
      }
      menuItem.photo = photoPath;
    }
  
    return this.menuItemRepository.save(menuItem);
  }

  async updateMenu(menuId: number, name: string): Promise<Menu> {
    const menu = await this.menuRepository.findOne({ where: { id: menuId } });
    if (!menu) throw new NotFoundException('Menu not found');
  
    menu.name = name;
    return this.menuRepository.save(menu);
  }

  async deleteMenu(menuId: number): Promise<{ message: string }> {
    const menu = await this.menuRepository.findOne({ where: { id: menuId }, relations: ['items'] });
    if (!menu) throw new NotFoundException('Menu not found');
  
    for (const item of menu.items) {
      if (item.photo) {
        const filePath = join(process.cwd(), 'uploads');
        try {
          await new Promise((resolve, reject) => {
            unlink(filePath, (err) => {
              if (err) reject(err);
              else resolve(null);
            });
          });
        } catch (err) {
          console.warn('Erreur lors de la suppression du fichier image :', err.message);
        }
      }
    }
  
    await this.menuRepository.delete(menuId);
    return { message: 'Menu supprimé avec succès' };
  }


  async deleteMenuItem(menuItemId: number): Promise<{ message: string }> {
    const item = await this.menuItemRepository.findOne({ where: { id: menuItemId } });
    if (!item) throw new NotFoundException('Menu item not found');

    if (item.photo) {
      await this.deletePhoto(item.photo);
    }

    await this.menuItemRepository.delete(menuItemId);
    return { message: 'Menu item supprimé avec succès' };
  }
}