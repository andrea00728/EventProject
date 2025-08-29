// import { Navigate } from "react-router-dom";
// import { useStateContext } from "../context/ContextProvider";

// export default function ProtectedRoute({ children, allowedRoles }) {
//   const { token, role, isLoading } = useStateContext();

//   if (isLoading) return <div>Chargement ...</div>;
//   if (!token) return <Navigate to="/pagepublic" replace />;
  
//   if (!allowedRoles.includes(role)) {
//     return <Navigate to="/pagepublic" replace />;
//   }

//   return children;
// }


import { Navigate } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, isLoading, user } = useStateContext();

  if (isLoading) {
    // Affiche un message de chargement tant que l'authentification est en cours
    return <div>Chargement...</div>;
  }
  
  if (!isAuthenticated || !allowedRoles.includes(user?.role)) {
    // Si non authentifié ou rôle non autorisé, redirige
    return <Navigate to="/pagepublic" replace />;
  }

  return children;
}