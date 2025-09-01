import { createContext, useContext, useState, useEffect } from "react";
import axiosClient from "../api/axios-client";

const StateContext = createContext({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: () => {},
  setIsAuthenticated: () => {},
  handleLogout: () => {},
  updateToken: () => {},
});

export const ContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- Charger l'utilisateur si token présent ---
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axiosClient.get("/auth/status", {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwt") || ""}`,
          },
        });

        console.log("Utilisateur chargé:", response.data.user);

        setUser(response.data.user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Erreur statut:", error.response?.status, error.response?.data);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // --- Déconnexion ---
  const handleLogout = async () => {
    try {
      await axiosClient.post("/auth/logout", {}, { withCredentials: true });
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error("Erreur déconnexion :", error);
      }
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      document.cookie = "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      localStorage.removeItem("jwt");
    }
  };

  // --- Mise à jour du token ---
  const updateToken = (newToken) => {
    if (newToken) {
      localStorage.setItem("jwt", newToken);
      document.cookie = `jwt=${newToken}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 jours
      setIsAuthenticated(true);
      console.log("✅ Nouveau token stocké:", newToken);
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
        updateToken,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
