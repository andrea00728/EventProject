import {  BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/Authentication/entities/auth.entity';
import { Evenement } from 'src/entities/Evenement';
import { Forfait } from 'src/entities/Forfait';

@Injectable()
export class ForfaitService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Evenement)
    private evenementRepository:Repository<Evenement>,
    @InjectRepository(Forfait) 
    private forfaitRepository:Repository<Forfait>
  ) {}

 async canCreateEvent(userId: string): Promise<boolean> {
  console.log(`Checking if user ${userId} can create event`);

  // Charger juste l'utilisateur avec son forfait
  const user = await this.userRepo.findOne({
    where: { id: userId },
    relations: ['forfait'],
  });

  if (!user) {
    console.log(`User ${userId} not found`);
    return false; // ou throw une erreur selon ton besoin
  }

  const maxEvents = user.forfait?.maxevents;

  console.log(`Max events for this forfait is ${maxEvents}`);

  // Si maxEvents est null ou undefined => illimité
  if (maxEvents === null || maxEvents === undefined) {
    console.log('No max events specified, allowing creation');
    return true;
  }

  // Compter directement le nombre d'événements de l'utilisateur dans la base
  const count = await this.evenementRepository.count({
    where: { user: { id: userId } },
  });

  console.log(`User has already created ${count} events`);

  return count < maxEvents;
}


  async canAddInvite(userId: string, currentInviteCount: number): Promise<boolean> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['forfait'],
    });

    const maxInvites = user?.forfait?.maxinvites;

    if (maxInvites === null || maxInvites === undefined) return true;

    return currentInviteCount < maxInvites;
  }

  // async isForfaitExpired(userId: string): Promise<boolean> {
  //   const user = await this.userRepo.findOne({
  //     where: { id: userId },
  //     relations: ['forfait'],
  //   });

  //   const expiration = user?.forfait?.expirationdate;
  //   if (!expiration) return false;

  //   return new Date() > new Date(expiration);
  // }



  /**
   * 
   * @param userId 
   * utilise pour léxpiration
   */
    async checkForfaitExpiration(userId: string): Promise<void> {
  const user = await this.userRepo.findOne({
    where: { id: userId },
    relations: ['forfait'],
  });
  if (!user) throw new BadRequestException('Utilisateur introuvable');

  const now = new Date();
  if (user.forfaitexpirationdate && user.forfaitexpirationdate < now && user.forfait.nom !== 'freemium') {
    // Rétrograder vers freemium si le forfait a expiré
    const freemiumForfait = await this.forfaitRepository.findOne({ where: { nom: 'freemium' } });
    if (!freemiumForfait) throw new BadRequestException('Forfait freemium introuvable');

    user.forfait = freemiumForfait;
    user.datedowngraded = now;
    user.forfaitexpirationdate = null; // Pas d'expiration pour freemium
    await this.userRepo.save(user);
    console.log(`Utilisateur ${userId} rétrogradé à freemium car le forfait a expiré.`);
  }
}

  /*************************************************************************************
   * ***************  Pour la page Super Admin dans le dashboard *********************
   * ********************************************************************************
   */

  /*************   Total des revenus des forfaits ********************** */

  async getSumForUsersForfait(): Promise<number> {
    const result = await this.userRepo
      .createQueryBuilder('users')
      .leftJoin('users.forfait', 'forfait')
      .select('SUM(forfait.price)', 'sum')
      .getRawOne();

    return Number(result.sum); // conversion en number
  }

// user.service.ts
  async findLastTransactions(limit: number = 5): Promise<
    { name: string; photo: string; nameForfait : string; amount: number; date: Date }[]
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
      nameForfait : r.nameforfait,
      amount: Number(r.amount),
      date: new Date(r.date),
    }));
  }

  //

  // async getMonthlyForfaitRevenue(): Promise<{ month: string; total: number }[]> {
  //   const result = await this.userRepo
  //     .createQueryBuilder('user')
  //     .leftJoin('user.forfait', 'forfait')
  //     .select([
  //       "TO_CHAR(user.forfaitexpirationdate, 'YYYY-MM') as month",
  //       'SUM(forfait.price) as total',
  //     ])
  //     .where('forfait.price > 0')
  //     .andWhere('user.forfaitexpirationdate IS NOT NULL')
  //     .groupBy("TO_CHAR(user.forfaitexpirationdate, 'YYYY-MM')")
  //     .orderBy("month", "ASC")
  //     .getRawMany();

  //   return result.map(r => ({
  //     month: r.month,
  //     total: parseFloat(r.total),
  //   }));
  // }

  // async getRevenusParForfait(): Promise<{ name: string; total: number }[]> {
  //   const results = await this.userRepo
  //     .createQueryBuilder('user')
  //     .leftJoin('user.forfait', 'forfait')
  //     .select('forfait.nom', 'name')
  //     .addSelect('SUM(forfait.price)', 'total')
  //     .where('forfait.price > 0')
  //     .groupBy('forfait.nom')
  //     .getRawMany();

  //   return results.map(r => ({
  //     name: r.name,
  //     total: parseFloat(r.total),
  //   }));
  // }

    // Dans ForfaitService
  async getMonthlyForfaitRevenue(months: number = 12): Promise<{ month: string; total: number }[]> {
    try {
      console.log('📊 Calcul des revenus mensuels pour', months, 'mois');

      // Requête SQL brute plus simple
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

      console.log('💰 Revenus calculés:', results);

      return results.map(result => ({
        month: this.formatMonth(result.month_key),
        total: parseFloat(result.total) || 0
      }));

    } catch (error) {
      console.error('❌ Erreur dans getMonthlyForfaitRevenue:', error);

      // Retour de données de test
      return [
        { month: 'Janvier 2025', total: 1200 },
        { month: 'Février 2025', total: 1500 },
        { month: 'Mars 2025', total: 900 }
      ];
    }
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
    // Étape 1 : récupérer les revenus groupés par forfait depuis userRepo
    const results = await this.userRepo
      .createQueryBuilder('user')
      .leftJoin('user.forfait', 'forfait')
      .select('forfait.nom', 'name')
      .addSelect('SUM(forfait.price)', 'total')
      .where('forfait.price > 0')
      .groupBy('forfait.nom')
      .getRawMany();

    // Étape 2 : somme totale des revenus
    const totalRevenu = results.reduce((acc, curr) => acc + parseFloat(curr.total), 0);

    // Étape 3 : formater les résultats avec pourcentage
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




}
