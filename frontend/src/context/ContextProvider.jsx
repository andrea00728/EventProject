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
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(!!user);
  const [isLoading, setIsLoading] = useState(!user);

  // Charger l'utilisateur depuis le backend si pas dans localStorage
  useEffect(() => {
    if (user) return setIsLoading(false);

    const checkAuthStatus = async () => {
      try {
        const response = await axiosClient.get("/auth/status", { withCredentials: true });
        setUser(response.data.user);
        setIsAuthenticated(true);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      } catch {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Centraliser la mise à jour du user et stockage local
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setIsAuthenticated(!!updatedUser);
  };

  const handleLogout = async () => {
    try {
      await axiosClient.post("/auth/logout");
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("user");
    }
  };

  return (
    <StateContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        setUser: updateUser,
        setIsAuthenticated,
        handleLogout,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
