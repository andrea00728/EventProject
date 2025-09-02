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
  const [user, setUserState] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- Chargement initial : vérifie localStorage d'abord ---
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUserState(JSON.parse(storedUser));
      setIsAuthenticated(true);
      setIsLoading(false);
      return; // pas besoin d'appeler /auth/status si localStorage existe
    }

    // Sinon, vérifie le serveur
    const checkAuthStatus = async () => {
      try {
        const response = await axiosClient.get("/auth/status", { withCredentials: true });
        setUserState(response.data.user);
        setIsAuthenticated(true);
      } catch (error) {
        setUserState(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // --- Wrapper pour setUser avec persistance locale ---
  const setUser = (userData) => {
    setUserState(userData);
    if (userData) localStorage.setItem("user", JSON.stringify(userData));
    else localStorage.removeItem("user");
  };

  // --- Déconnexion ---
  const handleLogout = async () => {
  try {
    await axiosClient.post("/auth/logout");
  } catch (err) {
    if (err.response?.status === 401) {
      // On n'affiche rien, l'intercepteur gère déjà le message
      return;
    }
    console.error("Erreur lors du logout:", err);
  } finally {
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = "/";
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
