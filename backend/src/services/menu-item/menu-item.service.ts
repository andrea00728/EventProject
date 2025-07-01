import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MenuItem } from 'src/entities/menu-item.entity';
import { Repository } from 'typeorm';
import { CreateMenuItemDto } from 'src/dto/create-menu-item.dto';
import { UpdateMenuItemDto } from 'src/dto/update-menu-item.dto';

@Injectable()
export class MenuItemService {
  constructor(
    @InjectRepository(MenuItem)
    private readonly menuItemRepository: Repository<MenuItem>,
  ) {}

  async create(dto: CreateMenuItemDto): Promise<MenuItem> {
    const item = this.menuItemRepository.create(dto);
    return this.menuItemRepository.save(item);
  }

  async findAll(): Promise<MenuItem[]> {
    return this.menuItemRepository.find();
  }

  async findByEvent(eventId: number): Promise<MenuItem[]> {
    return this.menuItemRepository.find({ where: { eventId } });
  }

  async update(id: number, dto: UpdateMenuItemDto): Promise<MenuItem> {
    const item = await this.menuItemRepository.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Menu ${id} non trouvé`);
    Object.assign(item, dto);
    return this.menuItemRepository.save(item);
  }

  async remove(id: number): Promise<void> {
    const item = await this.menuItemRepository.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Menu ${id} non trouvé`);
    await this.menuItemRepository.remove(item);
  }
}
