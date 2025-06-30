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
    console.log("Token initial chargé depuis sessionStorage :", storedToken);
    return storedToken || null;
  });
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const storedUser = sessionStorage.getItem("USER");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        console.log("👤 Utilisateur restauré depuis sessionStorage :", parsedUser);
      } catch (error) {
        console.error("Erreur lors du parsing du USER :", error);
      }
    }
  }, []);
  useEffect(() => {
    console.log("Vérification initiale du token :", token);
    const checkToken = () => {
      const storedToken = sessionStorage.getItem("ACCESS_TOKEN");
      if (storedToken || token) {
        setIsLoading(false);
      } else {
        setTimeout(checkToken, 500);
      }
    };
    checkToken();
  }, [token]);
  const setToken = (newToken) => {
    console.log("Mise à jour du token :", newToken);
    _setToken(newToken);
    if (newToken) {
      sessionStorage.setItem("ACCESS_TOKEN", newToken);
      setIsLoading(false);
    } else {
      sessionStorage.removeItem("ACCESS_TOKEN");
    }
  };
  const setUserAndStore = (userData) => {
    setUser(userData);
    if (userData) {
      sessionStorage.setItem("USER", JSON.stringify(userData));
      console.log("Utilisateur enregistré dans sessionStorage :", userData);
    } else {
      sessionStorage.removeItem("USER");
    }
  };

  return (
    <StateContext.Provider
      value={{
        user,
        token,
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
