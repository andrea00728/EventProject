import { createContext, useContext, useState, useEffect } from "react";
import axiosClient from "../api/axios-client";

const StateContext = createContext({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: () => {},
  setIsAuthenticated: () => {},
  handleLogout: () => {},
});

export const ContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifie l'état d'authentification au chargement initial de l'application
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axiosClient.get("/auth/status", {
          withCredentials: true,
        });
        console.log("Réponse de /auth/status:", response.data);
        console.log("Utilisateur chargé:", {
          id: response.data.user?.id,
          name: response.data.user?.name,
          email: response.data.user?.email,
          photo: response.data.user?.photo,
        });
        setUser(response.data.user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Erreur lors de la vérification du statut:", error);
        console.error("Détails de l'erreur:", {
          status: error.response?.status,
          data: error.response?.data,
        });
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuthStatus();
  }, []);

  // Fonction centralisée pour la déconnexion
  const handleLogout = async () => {
    try {
      await axiosClient.post("/auth/logout");
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error("Erreur lors de la déconnexion :", error);
      }
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      document.cookie = "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      localStorage.removeItem("jwt");
    }
  };

  // Ajout : Fonction pour mettre à jour le token
  const updateToken = (newToken) => {
    if (newToken) {
      localStorage.setItem("jwt", newToken);
      document.cookie = `jwt=${newToken}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 jours
      console.log("Nouveau token stocké:", newToken);
    }
  };

  return (
    <StateContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        setUser,
        role: user?.role || null,
        setIsAuthenticated,
        handleLogout,
        updateToken, // Ajout : Exposer updateToken
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);