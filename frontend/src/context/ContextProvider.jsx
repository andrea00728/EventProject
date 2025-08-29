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
        // Inclure les cookies dans la requête
        const response = await axiosClient.get("/auth/status", {
          withCredentials: true, // Permet d'envoyer les cookies
        });
        setUser(response.data.user);
        setIsAuthenticated(true);
      } catch (error) {
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
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);