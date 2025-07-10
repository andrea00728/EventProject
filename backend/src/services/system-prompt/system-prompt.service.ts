import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemPrompt } from 'src/entities/system-prompt.entity';
import { CreateSystemPromptDto, UpdateSystemPromptDto } from 'src/dto/system-prompt.dto';

@Injectable()
export class SystemPromptService {
  constructor(
    @InjectRepository(SystemPrompt)
    private readonly systemPromptRepository: Repository<SystemPrompt>,
  ) {}

  async createPrompt(dto: CreateSystemPromptDto): Promise<SystemPrompt> {
    // Désactiver tous les prompts existants
    await this.systemPromptRepository.update(
      { isActive: true },
      { isActive: false },
    );

    // Créer un nouveau prompt actif
    const newPrompt = this.systemPromptRepository.create({
      ...dto,
      isActive: true,
    });
    return this.systemPromptRepository.save(newPrompt);
  }

  async getPrompts(): Promise<SystemPrompt[]> {
    return this.systemPromptRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async getActivePrompt(): Promise<SystemPrompt> {
    const prompt = await this.systemPromptRepository.findOne({
      where: { isActive: true },
    });
    if (!prompt) {
      throw new HttpException('Aucun prompt actif trouvé.', HttpStatus.NOT_FOUND);
    }
    return prompt;
  }

  async updatePrompt(id: number, dto: UpdateSystemPromptDto): Promise<SystemPrompt> {
    const prompt = await this.systemPromptRepository.findOne({ where: { id } });
    if (!prompt) {
      throw new HttpException('Prompt non trouvé.', HttpStatus.NOT_FOUND);
    }

    if (dto.isActive) {
      // Désactiver tous les autres prompts si celui-ci devient actif
      await this.systemPromptRepository.update(
        { isActive: true },
        { isActive: false },
      );
    }

    return this.systemPromptRepository.save({
      ...prompt,
      ...dto,
    });
  }

  async deletePrompt(id: number): Promise<void> {
    const result = await this.systemPromptRepository.delete(id);
    if (result.affected === 0) {
      throw new HttpException('Prompt non trouvé.', HttpStatus.NOT_FOUND);
    }
  }
}