import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  fr: {
    translation: {
      discoverMenus: "Découvrez Nos Menus !",
      tastyDishes: "Des plats savoureux, préparés avec soin.",
      searchPlaceholder: "Rechercher un plat...",
      cart: "Votre Panier",
      emptyCart: "Votre panier est vide. Ajoutez des plats pour commencer !",
      add: "Ajouter",
      unavailable: "Indisponible",
      stock: "Stock",
      outOfStock: "Épuisé",
      validateOrder: "Valider la commande",
      total: "Total :",
      invoice: "Facture",
      downloadPDF: "📄 Télécharger PDF",
      close: "Fermer",
      quantityMaxReached: "Quantité maximale atteinte pour \"{{name}}\" (stock : 0).",
      itemAdded: "Article ajouté au panier !",
      itemRemoved: "Article retiré du panier.",
      emptyCartMessage: "Votre panier est vide.",
      noMenus: "Aucun menu disponible pour le moment ou aucun résultat pour votre recherche.",
      reduceQty: "Réduire la quantité",
      increaseQty: "Augmenter la quantité",
      removeItem: "Retirer l'article",
      date: "Date",
      event: "Événement",
      table: "Table",
      orderDetails: "Détails de la commande :",
      article: "Article",
      qtyXPrice: "Qté x Prix",
      totalPrice: "Total"
    }
  },
  en: {
    translation: {
      discoverMenus: "Discover Our Menus!",
      tastyDishes: "Tasty dishes, carefully prepared.",
      searchPlaceholder: "Search for a dish...",
      cart: "Your Cart",
      emptyCart: "Your cart is empty. Add some dishes to start!",
      add: "Add",
      unavailable: "Unavailable",
      stock: "Stock",
      outOfStock: "Out of Stock",
      validateOrder: "Validate Order",
      total: "Total:",
      invoice: "Invoice",
      downloadPDF: "📄 Download PDF",
      close: "Close",
      quantityMaxReached: "Maximum quantity reached for \"{{name}}\" (stock: 0).",
      itemAdded: "Item added to cart!",
      itemRemoved: "Item removed from cart.",
      emptyCartMessage: "Your cart is empty.",
      noMenus: "No menus available currently or no search results.",
      reduceQty: "Reduce quantity",
      increaseQty: "Increase quantity",
      removeItem: "Remove item",
      date: "Date",
      event: "Event",
      table: "Table",
      orderDetails: "Order details:",
      article: "Article",
      qtyXPrice: "Qty x Price",
      totalPrice: "Total"
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'fr',
  fallbackLng: 'fr',
  interpolation: {
    escapeValue: false
  }
});

export default i18n;
