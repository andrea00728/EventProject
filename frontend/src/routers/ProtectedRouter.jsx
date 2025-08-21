import { Navigate } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { token, role, isLoading } = useStateContext();

  if (isLoading) return <div>Chargement ...</div>;
  if (!token) return <Navigate to="/pagepublic" replace />;
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/pagepublic" replace />;
  }

  return children;
}
