import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Satisfaction } from 'src/entities/satisfaction.entity';
import { CreateSatisfactionDto } from 'src/dto/create-satisfaction.dto';

@Injectable()
export class SatisfactionService {
  constructor(
    @InjectRepository(Satisfaction)
    private satisfactionRepository: Repository<Satisfaction>,
  ) {}

  async create(createSatisfactionDto: CreateSatisfactionDto, user: any) {
    const satisfaction = new Satisfaction();
    satisfaction.isSatisfied = createSatisfactionDto.isSatisfied ?? false; // Utiliser false si non fourni
    satisfaction.userEmail = user.email;
    satisfaction.userName = user.name || null;
    satisfaction.userPhoto = user.photo || null;

    return this.satisfactionRepository.save(satisfaction);
  }

  findAll() {
    return this.satisfactionRepository.find();
  }

  findOne(id: number) {
    return this.satisfactionRepository.findOneBy({ id });
  }
}