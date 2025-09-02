

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
    return <Navigate to="/" replace />;
  }

  return children;
}