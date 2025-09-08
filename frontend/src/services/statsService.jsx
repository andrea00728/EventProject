import axiosClient from "../api/axios-client";

const statsService = {
  // Récupérer les statistiques des rôles d'utilisateurs
  async fetchUserRoleStats() {
    try {
      console.log("Fetching user role stats");
      const response = await axiosClient.get("/auth/user-role-stats");
      return response.data;
    } catch (error) {
      console.error("Error fetching user role stats:", error.response?.data);
      throw new Error(
        error.response?.data?.message || "Erreur lors de la récupération des rôles"
      );
    }
  },

  // Récupérer le nombre total d'événements
  async fetchEventCount() {
    try {
      console.log("Fetching event count");
      const response = await axiosClient.get("/evenements/countEvent");
      return response.data;
    } catch (error) {
      console.error("Error fetching event count:", error.response?.data);
      throw new Error(
        error.response?.data?.message || "Erreur lors de la récupération des événements"
      );
    }
  },

  // Récupérer les revenus mensuels
  async fetchMonthlyRevenue() {
    try {
      console.log("Fetching monthly revenue");
      const response = await axiosClient.get("/forfait/revenu-mensuel");
      return response.data;
    } catch (error) {
      console.error("Error fetching monthly revenue:", error.response?.data);
      throw new Error(
        error.response?.data?.message || "Erreur lors de la récupération des revenus"
      );
    }
  },

  // Récupérer tous les événements
  async fetchAllEvents() {
    try {
      console.log("Fetching all events");
      const response = await axiosClient.get("/evenements");
      return response.data;
    } catch (error) {
      console.error("Error fetching events:", error.response?.data);
      throw new Error(
        error.response?.data?.message || "Erreur lors de la récupération des événements"
      );
    }
  },

  // Récupérer les inscriptions mensuelles
  async fetchMonthlyRegistrations() {
    try {
      console.log("Fetching monthly registrations");
      const response = await axiosClient.get("/auth/monthly-registrations");
      return response.data;
    } catch (error) {
      console.error("Error fetching monthly registrations:", error.response?.data);
      throw new Error(
        error.response?.data?.message || "Erreur lors de la récupération des inscriptions"
      );
    }
  },

  // Récupérer toutes les statistiques en une seule requête
  async fetchAllStats() {
    try {
      console.log("Fetching all statistics");
      const [rolesData, totalEvents, revenueData, allEvents, registrationsData] = await Promise.all([
        this.fetchUserRoleStats(),
        this.fetchEventCount(),
        this.fetchMonthlyRevenue(),
        this.fetchAllEvents(),
        this.fetchMonthlyRegistrations(),
      ]);

      const rolesIncluded = ['organisateur', 'caissier', 'cuisinier'];
      const includedCount = rolesData.filter(r => rolesIncluded.includes(r.role)).reduce((acc, r) => acc + r.count, 0);
      const totalUsers = rolesData.reduce((acc, r) => acc + r.count, 0);
      const organizerCount = rolesData.find(r => r.role === 'organisateur')?.count || 0;

      const userRate = totalUsers > 0 ? ((includedCount / totalUsers) * 100).toFixed(1) : '0.0';
      const organizerRate = totalUsers > 0 ? ((organizerCount / totalUsers) * 100).toFixed(1) : '0.0';

      const totalRevenueValue = revenueData.reduce((sum, f) => sum + f.total, 0);
      const formattedRevenue = `€ ${totalRevenueValue}`;

      const counts = {};
      for (let ev of allEvents) {
        counts[ev.type] = (counts[ev.type] || 0) + 1;
      }
      const eventTypeData = Object.entries(counts).map(([type, count]) => ({
        type,
        count,
      }));

      return {
        userRate,
        organizerRate,
        eventCount: totalEvents,
        revenueTotal: formattedRevenue,
        eventTypeData,
        registrationData: registrationsData,
      };
    } catch (error) {
      console.error("Error fetching all stats:", error.response?.data);
      throw new Error(
        error.response?.data?.message || "Erreur inconnue lors de la récupération des statistiques"
      );
    }
  },

  // Définir le token pour les requêtes authentifiées
  setAuthToken(isAuthenticated) {
    console.log("Setting auth token:",isAuthenticated  ? "Token set" : "Token removed");
    if (isAuthenticated) {
      axiosClient.defaults.headers.common["Authorization"] ;
    } else {
      delete axiosClient.defaults.headers.common["Authorization"];
    }
  },
};

export default statsService;