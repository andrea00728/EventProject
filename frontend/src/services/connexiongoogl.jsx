

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider";

function ConnexionGoogle() {
  const navigate = useNavigate();
  const { isLoading, isAuthenticated, user } = useStateContext();

  useEffect(() => {
    // Si la vérification est toujours en cours, ne fais rien
    if (isLoading) {
      return;
    }

    // Si l'authentification est réussie, navigue vers la bonne page
    if (isAuthenticated) {
        // Tu peux vérifier le rôle de l'utilisateur pour la redirection
        if (user.isInPersonnel) {
            navigate("/choix-role", { replace: true });
        } else {
            navigate("/", { replace: true });
        }
    } else {
        // Sinon, redirige vers la page publique
        navigate("/", { replace: true });
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  if (isLoading) {
    return <div>Connexion en cours...</div>;
  }

  return null;
}

export default ConnexionGoogle;