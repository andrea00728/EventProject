import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Commande } from 'src/entities/commande.entity';
import { CreateCommandeDto } from 'src/dto/create-commande.dto';

@Injectable()
export class CommandeService {
  constructor(
    @InjectRepository(Commande)
    private readonly commandeRepository: Repository<Commande>,
  ) {}

  async findOne(id: number): Promise<Commande> {
    const commande = await this.commandeRepository.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!commande) {
      throw new NotFoundException(`Commande ${id} introuvable`);
    }
    return commande;
  }

  async create(dto: CreateCommandeDto): Promise<Commande> {
    const commande = this.commandeRepository.create(dto);
    return await this.commandeRepository.save(commande);
  }

  async findAll(): Promise<Commande[]> {
    return await this.commandeRepository.find({ relations: ['items'] });
  }
}
