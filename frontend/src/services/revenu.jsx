import axios from "axios";
import axiosClient from "../api/axios-client";

// Service pour gérer les appels API liés aux revenus
const revenuService = {
  /**
   * Récupère toutes les commandes pour un événement donné.
   * @param {string} eventId - L'ID de l'événement.
   * @returns {Promise<object>} Les données de la réponse de l'API.
   */
  async getOrdersByEvent(eventId) {
    try {
      console.log(`Fetching orders for eventId: ${eventId}`);
      const response = await axiosClient.get(`/orders/event/${eventId}`, {
        params: { include: "table,items,items.menuItem" },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching orders:", error.response?.data);
      throw new Error(
        error.response?.data?.message ||
          "Erreur lors de la récupération des commandes"
      );
    }
  } /**
   * Récupère une commande par son ID.
   * @param {string} orderId - L'ID de la commande.
   * @returns {Promise<object>} Les données de la commande.
   */,

  async getOrderById(orderId) {
    try {
      console.log(`Fetching order with ID: ${orderId}`);
      const response = await axiosClient.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching order:", error.response?.data);
      throw new Error(
        error.response?.data?.message ||
          "Erreur lors de la récupération de la commande"
      );
    }
  } /**
   * Marque une commande comme remboursée.
   * @param {string} orderId - L'ID de la commande à rembourser.
   * @returns {Promise<object>} Les données de la commande mise à jour.
   */,

  async refundOrder(orderId) {
    try {
      console.log(`Attempting to refund order with ID: ${orderId}`);
      const response = await axiosClient.patch(`/orders/${orderId}/refunded`, {
        paymentStatus: "refunded",
      });
      console.log(`Refund successful for orderId: ${orderId}`, response.data);
      return response.data;
    } catch (error) {
      console.error("Refund error:", error.response?.data);
      throw new Error(
        error.response?.data?.message ||
          "Erreur lors du remboursement de la commande"
      );
    }
  } /**
   * Définit le token d'authentification pour toutes les requêtes.
   * @param {string|null} token - Le token JWT de l'utilisateur.
   */,

  setAuthToken(isAuthenticated) {
    console.log(
      "Setting auth token:",
      isAuthenticated ? "Token set" : "Token removed"
    );
    if (isAuthenticated) {
      // Applique le token à chaque en-tête de requête 'Authorization'
      axiosClient.defaults.headers.common["Authorization"] =
        `${isAuthenticated}`;
    } else {
      // Supprime le token de l'en-tête
      delete axiosClient.defaults.headers.common["Authorization"];
    }
  },

  /**
   * Récupère toutes les commandes remboursées pour un événement donné.
   * @param {string} eventId - L'ID de l'événement.
   * @returns {Promise<object>} Les données des commandes remboursées.
   */
  async getRefundedOrders(eventId) {
    try {
      console.log(`Fetching refunded orders for eventId: ${eventId}`);
      const response = await axiosClient.get(
        `/orders/event/${eventId}/refunded`,
        {
          params: { include: "table,items,items.menuItem,refundedBy" },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching refunded orders:", error.response?.data);
      throw new Error(
        error.response?.data?.message ||
          "Erreur lors de la récupération des commandes remboursées"
      );
    }
  },
};

export default revenuService;
