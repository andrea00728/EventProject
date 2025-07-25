import { useStateContext } from "../../context/ContextProvider";
import { Navigate } from "react-router-dom";
import DashboardpersCuisine from "../../pages/PersonnelCuisine/Dashboard";


export default function PersonnelCuisine() {
  const { token, role } = useStateContext();

  if (!token) {
    return <Navigate to="/pagepublic" replace />;
  }

  switch (role) {
    case "cuisinier":
      break; 
    case "organisateur":
      return <Navigate to="/accueil" replace />;
    case "accueil":
      return <Navigate to="/personnelAccueil" replace />;
    case "caissier":
      return <Navigate to="/personnelCaisse" replace />;
    default:
      return <Navigate to="/pagepublic" replace />;
  }

  return (
    <>
      <DashboardpersCuisine/>
    </>
  );
}
