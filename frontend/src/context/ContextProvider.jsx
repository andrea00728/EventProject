import { createContext, useContext, useState, useEffect } from "react";

const StateContext = createContext({
  user: null,
  token: null,
  isLoading: false,
  setUser: () => {},
  setToken: () => {},
});

export const ContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, _setToken] = useState(() => {
    const storedToken = sessionStorage.getItem("ACCESS_TOKEN");
    return storedToken || null;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("USER");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsLoading(false); // Déplacer ici pour garantir que l'état est prêt
      } catch (error) {
        console.error("Erreur lors du parsing du USER :", error);
        setIsLoading(false); // Optionnel : gérer l'erreur différemment si nécessaire
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const setToken = (newToken) => {
    _setToken(newToken);
    if (newToken) {
      sessionStorage.setItem("ACCESS_TOKEN", newToken);
    } else {
      sessionStorage.removeItem("ACCESS_TOKEN");
    }
  };

  const setUserAndStore = (userData) => {
    setUser(userData);
    if (userData) {
      sessionStorage.setItem("USER", JSON.stringify(userData));
    } else {
      sessionStorage.removeItem("USER");
    }
  };

  return (
    <StateContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        isLoading,
        setUser: setUserAndStore,
        setToken,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);