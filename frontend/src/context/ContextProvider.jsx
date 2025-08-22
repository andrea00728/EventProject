// import { createContext, useContext, useState, useEffect } from "react";

// const StateContext = createContext({
//   user: null,
//   token: null,
//   isLoading: false,
//   setUser: () => {},
//   setToken: () => {},
// });

// export const ContextProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [token, _setToken] = useState(() => {
//     const storedToken = localStorage.getItem("ACCESS_TOKEN");
//     return storedToken || null;
//   });
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const storedUser = localStorage.getItem("USER");
//     if (storedUser) {
//       try {
//         const parsedUser = JSON.parse(storedUser);
//         setUser(parsedUser);
//       } catch (error) {
//         console.error("Erreur lors du parsing du USER :", error);
//       }
//     }
//     setIsLoading(false); 
//   }, []);

//   const setToken = (newToken) => {
//     _setToken(newToken);
//     if (newToken) {
//       localStorage.setItem("ACCESS_TOKEN", newToken);
//       setIsLoading(false);
//     } else {
//       localStorage.removeItem("ACCESS_TOKEN");
//     }
//   };

//   const setUserAndStore = (userData) => {
//     setUser(userData);
//     if (userData) {
//       localStorage.setItem("USER", JSON.stringify(userData));
//     } else {
//       localStorage.removeItem("USER");
//     }
//   };

//   return (
//     <StateContext.Provider
//       value={{
//         user,
//         token,
//         role: user?.role || null, 
//         setUser: setUserAndStore,
//         setToken,
//       }}
//     >
//       {children}
//     </StateContext.Provider>
//   );
// };

// export const useStateContext = () => useContext(StateContext);


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
  }, []); // L'effet s'exécute uniquement au premier rendu

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setIsLoading(false); // Ajout pour s'assurer que l'état de chargement est à false
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