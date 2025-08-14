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
  token: null,
  refreshToken: null,
  isLoading: true,
  setUser: () => {},
  setToken: () => {},
  setRefreshToken: () => {},
});

export const ContextProvider = ({ children }) => {
  const [user, setUserState] = useState(() => {
    const storedUser = localStorage.getItem("USER");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [token, setTokenState] = useState(() => localStorage.getItem("ACCESS_TOKEN") || null);
  const [refreshToken, setRefreshTokenState] = useState(() => localStorage.getItem("REFRESH_TOKEN") || null);
  const [isLoading, setIsLoading] = useState(true);

  // Fonctions pour mettre à jour l'état et le localStorage
  const setToken = (newToken) => {
    setTokenState(newToken);
    if (newToken) {
      localStorage.setItem("ACCESS_TOKEN", newToken);
    } else {
      localStorage.removeItem("ACCESS_TOKEN");
    }
  };

  const setRefreshToken = (newRefreshToken) => {
    setRefreshTokenState(newRefreshToken);
    if (newRefreshToken) {
      localStorage.setItem("REFRESH_TOKEN", newRefreshToken);
    } else {
      localStorage.removeItem("REFRESH_TOKEN");
    }
  };

  const setUser = (userData) => {
    setUserState(userData);
    if (userData) {
      localStorage.setItem("USER", JSON.stringify(userData));
    } else {
      localStorage.removeItem("USER");
    }
  };

  // Effet qui se déclenche une seule fois au montage
  useEffect(() => {
    const checkAuth = () => {
      // Si le refresh token n'existe pas, l'utilisateur est déconnecté
      if (!localStorage.getItem("REFRESH_TOKEN")) {
        setUser(null);
        setToken(null);
        setRefreshToken(null);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  return (
    <StateContext.Provider
      value={{
        user,
        token,
        refreshToken,
        role: user?.role || null,
        isLoading,
        setUser,
        setToken,
        setRefreshToken,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);