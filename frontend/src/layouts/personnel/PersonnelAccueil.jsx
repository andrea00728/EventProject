import { useStateContext } from "../../context/ContextProvider";
import { Navigate } from "react-router-dom";

export default function PersonnelAccueil() {
  const { token, role } = useStateContext();
  if (!token) {
    return <Navigate to="/pagepublic" replace />;
  }

  switch (role) {
    case "accueil":
      // Reste sur cette page
      break;
    case "organisateur":
      return <Navigate to="/accueil" replace />;
    case "caissier":
      return <Navigate to="/personnelCaisse" replace />;
    case "cuisinier":
      return <Navigate to="/personnelCuisine" replace />;
    default:
      return <Navigate to="/pagepublic" replace />;
  }

  return (
    <>
      <h1>Bienvenue sur la page d'accueil du personnel</h1>
      <p>Voici les informations importantes pour le personnel.</p>
    </>
  );
}
