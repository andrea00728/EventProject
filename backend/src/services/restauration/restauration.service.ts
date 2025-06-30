import { Injectable, NotFoundException } from '@nestjs/common';
import { Categorie } from 'src/entities/categorie.entity';
import { CommandeStatus } from 'src/entities/commande.entity';
import { MenuItem } from 'src/entities/menu-item.entity';
import { Commande } from 'src/entities/commande.entity';



@Injectable()
export class RestaurationService {
  private categories: Categorie[] = [];
  private menuItems: MenuItem[] = [];
  private commandes: Commande[] = [];

  // Gestion des catégories
  getCategories(eventId: number): Categorie[] {
    return this.categories.filter(cat => cat.eventId === eventId);
  }
  createCategorie(categorie: Categorie) {
    categorie.id = this.categories.length + 1;
    this.categories.push(categorie);
  }

  // Gestion des menu items
  getMenuItems(eventId: number): MenuItem[] {
    return this.menuItems.filter(item => item.eventId === eventId);
  }
  createMenuItem(item: MenuItem) {
    item.id = this.menuItems.length + 1;
    this.menuItems.push(item);
  }

  // Gestion des commandes
  getCommandes(eventId: number): Commande[] {
    return this.commandes.filter(cmd => cmd.eventId === eventId);
  }
  getCommandeById(eventId: number, id: number): Commande {
    const commande = this.commandes.find(c => c.eventId === eventId && c.id === id);
    if (!commande) throw new NotFoundException(`Commande ${id} introuvable pour événement ${eventId}`);
    return commande;
  }
  createCommande(cmd: Commande) {
    cmd.id = this.commandes.length + 1;
    cmd.statut = 'en_attente';
    cmd.createdAt = new Date();
    this.commandes.push(cmd);
  }
  updateCommandeStatus(eventId: number, id: number, statut: CommandeStatus) {
    const commande = this.getCommandeById(eventId, id);
    commande.statut = statut;
  }
}
