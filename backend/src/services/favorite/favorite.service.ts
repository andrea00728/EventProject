import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from 'src/entities/Favorite';
import { Evenement } from 'src/entities/Evenement';
import { User } from 'src/Authentication/entities/auth.entity';
import { CreateFavoriteDto } from 'src/dto/create-favorite.dto';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
    @InjectRepository(Evenement)
    private evenementRepository: Repository<Evenement>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async addFavorite(userId: string, createFavoriteDto: CreateFavoriteDto): Promise<Favorite> {
    const { evenementId, note } = createFavoriteDto;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const evenement = await this.evenementRepository.findOne({ where: { id: evenementId } });
    if (!evenement) {
      throw new NotFoundException('Événement non trouvé');
    }

    if (!evenement.isPublic && evenement.user.id !== userId) {
      throw new ForbiddenException('Vous ne pouvez pas ajouter cet événement non public aux favoris');
    }

    const existingFavorite = await this.favoriteRepository.findOne({
      where: { user: { id: userId }, evenement: { id: evenementId } },
    });
    if (existingFavorite) {
      throw new ForbiddenException('Cet événement est déjà dans vos favoris');
    }

    const favorite = this.favoriteRepository.create({
      user,
      evenement,
      note,
    });

    return this.favoriteRepository.save(favorite);
  }

  async removeFavorite(userId: string, evenementId: number): Promise<void> {
    const favorite = await this.favoriteRepository.findOne({
      where: { user: { id: userId }, evenement: { id: evenementId } },
    });
    if (!favorite) {
      throw new NotFoundException('Favori non trouvé');
    }

    await this.favoriteRepository.remove(favorite);
  }

  async getUserFavorites(userId: string): Promise<Favorite[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return this.favoriteRepository.find({
      where: { user: { id: userId } },
      relations: ['evenement'],
      order: { createdAt: 'DESC' },
    });
  }
}