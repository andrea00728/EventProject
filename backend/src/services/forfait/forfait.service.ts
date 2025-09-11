import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/Authentication/entities/auth.entity';
import { Evenement } from 'src/entities/Evenement';
import { Forfait } from 'src/entities/Forfait';
import { CreateForfaitDto } from 'src/dto/create-forfait.dto';
import { UpdateForfaitDto } from 'src/dto/update-forfait.dto';


@Injectable()
export class ForfaitService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Evenement)
    private evenementRepository: Repository<Evenement>,
    @InjectRepository(Forfait)
    private forfaitRepository: Repository<Forfait>
  ) {}

  async canCreateEvent(userId: string): Promise<boolean> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['forfait'],
    });
    if (!user) return false;

    const maxEvents = user.forfait?.maxevents;
    if (maxEvents == null) return true;

    const count = await this.evenementRepository.count({
      where: { user: { id: userId } },
    });

    return count < maxEvents;
  }

  async canAddInvite(userId: string, currentInviteCount: number): Promise<boolean> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['forfait'],
    });
    const maxInvites = user?.forfait?.maxinvites;
    if (maxInvites == null) return true;

    return currentInviteCount < maxInvites;
  }

  async checkForfaitExpiration(userId: string): Promise<void> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['forfait'],
    });
    if (!user) throw new BadRequestException('Utilisateur introuvable');

    const now = new Date();
    if (user.forfaitexpirationdate && user.forfaitexpirationdate < now && user.forfait.nom !== 'freemium') {
      const freemiumForfait = await this.forfaitRepository.findOne({ where: { nom: 'freemium' } });
      if (!freemiumForfait) throw new BadRequestException('Forfait freemium introuvable');

      user.forfait = freemiumForfait;
      user.datedowngraded = now;
      user.forfaitexpirationdate = null;
      await this.userRepo.save(user);
    }
  }

  async getSumForUsersForfait(): Promise<number> {
    const result = await this.userRepo
      .createQueryBuilder('users')
      .leftJoin('users.forfait', 'forfait')
      .select('SUM(forfait.price)', 'sum')
      .getRawOne();

    return Number(result?.sum) || 0;
  }

  async findLastTransactions(limit: number = 5): Promise<
    { name: string; photo: string; nameForfait: string; amount: number; date: Date }[]
  > {
    const results = await this.userRepo
      .createQueryBuilder('user')
      .leftJoin('user.forfait', 'forfait')
      .select([
        'user.name AS name',
        'user.photo AS photo',
        'forfait.nom AS nameForfait',
        'forfait.price AS amount',
        'user.forfaitexpirationdate AS date',
      ])
      .where('forfait.price > 0')
      .andWhere('user.forfaitexpirationdate IS NOT NULL')
      .orderBy('user.forfaitexpirationdate', 'DESC')
      .limit(limit)
      .getRawMany();

    return results.map(r => ({
      name: r.name,
      photo: r.photo,
      nameForfait: r.nameForfait,
      amount: Number(r.amount),
      date: new Date(r.date),
    }));
  }

  async getMonthlyForfaitRevenue(months: number = 12): Promise<{ month: string; total: number }[]> {
    const results = await this.userRepo.query(`
      SELECT 
        TO_CHAR(u.forfaitexpirationdate, 'YYYY-MM') as month_key,
        SUM(f.price) as total
      FROM users u
      LEFT JOIN forfait f ON f.id = u.forfait_id
      WHERE f.price > 0
        AND u.forfaitexpirationdate IS NOT NULL
        AND u.forfaitexpirationdate >= NOW() - INTERVAL '${months} months'
      GROUP BY TO_CHAR(u.forfaitexpirationdate, 'YYYY-MM')
      ORDER BY TO_CHAR(u.forfaitexpirationdate, 'YYYY-MM') ASC
    `);

    return results.map(result => ({
      month: this.formatMonth(result.month_key),
      total: parseFloat(result.total) || 0
    }));
  }

  private formatMonth(monthKey: string): string {
    const [year, month] = monthKey.split('-');
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return `${months[parseInt(month) - 1]} ${year}`;
  }

  async getRevenusPourcentagesParForfait(): Promise<{ name: string; total: number; percentage: number }[]> {
    const results = await this.userRepo
      .createQueryBuilder('user')
      .leftJoin('user.forfait', 'forfait')
      .select('forfait.nom', 'name')
      .addSelect('SUM(forfait.price)', 'total')
      .where('forfait.price > 0')
      .groupBy('forfait.nom')
      .getRawMany();

    const totalRevenu = results.reduce((acc, curr) => acc + parseFloat(curr.total || 0), 0);

    const allForfaits = await this.forfaitRepository.find();

    return allForfaits.map(forfait => {
      const revenu = results.find(r => r.name === forfait.nom);
      const total = revenu ? parseFloat(revenu.total) : 0;
      const percentage = totalRevenu > 0 ? (total / totalRevenu) * 100 : 0;

      return {
        name: forfait.nom,
        total,
        percentage: parseFloat(percentage.toFixed(2)),
      };
    });
  }

  async getEventsByType(): Promise<{ type: string; count: number }[]> {
    const results = await this.evenementRepository
      .createQueryBuilder('evenement')
      .select('evenement.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('evenement.type IS NOT NULL')
      .groupBy('evenement.type')
      .orderBy('COUNT(*)', 'DESC')
      .getRawMany();

    return results.map(result => ({
      type: result.type,
      count: parseInt(result.count) || 0
    }));
  }



  // by claudio
  // Nouveaux services pour la gestion des forfaits
  async create(createForfaitDto: CreateForfaitDto): Promise<Forfait> {
    const nouveauForfait = this.forfaitRepository.create(createForfaitDto);
    return this.forfaitRepository.save(nouveauForfait);
  }

  // modifier les forfaits
  async update(idForfait: number, updateForfaitDto: UpdateForfaitDto): Promise<Forfait> {
    const forfait = await this.forfaitRepository.preload({
      id: idForfait,
      ...updateForfaitDto,
    });

    if (!forfait) {
      throw new NotFoundException(`Forfait with ID ${idForfait} not found`);
    }

    return this.forfaitRepository.save(forfait);
  }

  // fonction pour supprimer le forfaits
    async remove(id: number): Promise<void> {
    const result = await this.forfaitRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Forfait with ID ${id} not found`);
    }
  }
}