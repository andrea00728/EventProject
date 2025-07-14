import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evenement } from 'src/entities/Evenement';
import { Personnel } from 'src/entities/Personnel';
import { CreatePersonnelDto } from 'src/dto/PersonnelDto';

@Injectable()
export class PersonnelService {
  constructor(
    @InjectRepository(Personnel)
    private personnelRepository: Repository<Personnel>,

    @InjectRepository(Evenement)
    private evenementRepository: Repository<Evenement>,
  ) {}

  async create(dto: CreatePersonnelDto, userId: string): Promise<Personnel> {
    const evenement = await this.evenementRepository.findOne({
      where: {
        id: Number(dto.evenementId),
        user: {
          id: userId,
        },
      },
      relations: ['user'],
    });

    if (!evenement) {
      throw new BadRequestException("Événement non trouvé pour cet utilisateur.");
    }

    const personnel = this.personnelRepository.create({
      nom: dto.nom,
      email: dto.email,
      role: dto.role,
      evenement,
    });

    return this.personnelRepository.save(personnel);
  }

  async findByEvenement(evenementId: number): Promise<Personnel[]> {
    return this.personnelRepository.find({
      where: {
        evenement: {
          id: evenementId,
        },
      },
      relations: ['evenement'],
    });
  }
}
