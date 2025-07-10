import { useStateContext } from "../../context/ContextProvider";
import { Navigate } from "react-router-dom";

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
      <h1>Bienvenue sur la page d'accueil de la cuisine</h1>
      <p>Voici les informations importantes pour le personnel de la cuisine.</p>
    </>
  );
}
