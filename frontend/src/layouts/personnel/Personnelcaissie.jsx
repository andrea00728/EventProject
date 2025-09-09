import { useStateContext } from "../../context/ContextProvider";
import { Navigate, Outlet } from "react-router-dom";

export default function PersonnelCaisse() {
  const { isAuthenticated, role } = useStateContext();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  switch (role) {
    case "caissier":
      break; 
    case "organisateur":
      return <Navigate to="/accueil" replace />;
    case "accueil":
      return <Navigate to="/personnelAccueil" replace />;
    case "cuisinier":
      return <Navigate to="/personnelCuisine" replace />;
    default:
      return <Navigate to="/" replace />;
  }
  return (
    <>
      <Outlet/>
    </>
  );
}
