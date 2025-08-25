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

  //Vérifie l'état d'authentification au chargement initial de l'application
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axiosClient.get("/auth/status");
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
  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    // On ne met pas isLoading à false ici car il est déjà false après la vérification initiale
    // et il est géré par la logique du useEffect
    localStorage.removeItem("ACCESS_TOKEN");
    localStorage.removeItem("USER");
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



