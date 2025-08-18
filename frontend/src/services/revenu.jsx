import axios from "axios";

const API_BASE_URL = "http://localhost:3000"; 


const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Service pour gérer les appels API liés aux revenus
const revenuService = {
  async getOrdersByEvent(eventId) {
    try {
      console.log(`Fetching orders for eventId: ${eventId}`);
      const response = await axiosInstance.get(`/orders/event/${eventId}`, {
        params: { include: "table,items,items.menuItem" },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching orders:", error.response?.data);
      throw new Error(
        error.response?.data?.message || "Erreur lors de la récupération des commandes"
      );
    }
  },

  // Récupérer une commande par ID
  async getOrderById(orderId) {
    try {
      console.log(`Fetching order with ID: ${orderId}`);
      const response = await axiosInstance.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching order:", error.response?.data);
      throw new Error(
        error.response?.data?.message || "Erreur lors de la récupération de la commande"
      );
    }
  },

  // Marquer une commande comme remboursée
  async refundOrder(orderId) {
    try {
      console.log(`Attempting to refund order with ID: ${orderId}`);
      const response = await axiosInstance.patch(`/orders/${orderId}/refunded`, {
        paymentStatus: "refunded",
      });
      console.log(`Refund successful for orderId: ${orderId}`, response.data);
      return response.data;
    } catch (error) {
      console.error("Refund error:", error.response?.data);
      throw new Error(
        error.response?.data?.message || "Erreur lors du remboursement de la commande"
      );
    }
  },

  // Définir le token pour les requêtes
  setAuthToken(token) {
    console.log("Setting auth token:", token ? "Token set" : "Token removed");
    if (token) {
      axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axiosInstance.defaults.headers.common["Authorization"];
    }
  },
};

export default revenuService;