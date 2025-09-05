
// import { useEffect, useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { useStateContext } from "../context/ContextProvider";

// function ConnexionGoogle() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { setUser, setToken } = useStateContext();
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const searchParams = new URLSearchParams(location.search);
//     const token = searchParams.get("token");
//     const name = searchParams.get("name");
//     const email = searchParams.get("email");
//     const photo = searchParams.get("photo");
//     const role = searchParams.get("role"); 

//     console.log("🔐 Token extrait :", token);
//     console.log("👤 Infos :", { name, email, photo, role });

//     /**
//      * ty ilay manao mijery anazy hoe inona ny role anany
//      * @param {string} role
//      */

//     const isInPersonnel=searchParams.get("isInPersonnel")?.toLowerCase()==="true";
//     if (token && email && name && role) {
    
//       setToken(token);
//       setUser({
//         name: decodeURIComponent(name),
//         email: decodeURIComponent(email),
//         photo: decodeURIComponent(photo || ""),
//         role: decodeURIComponent(role),
//         isInPersonnel,
//       });
      
//       if(isInPersonnel){
//         navigate("/choix-role");
//       }else{
//       // switch (decodeURIComponent(role)) {
//       //   case "organisateur":
//       //     navigate("/accueil", { replace: true });
//       //     break;
//       //   case "caissier":
//       //     navigate("/personnelCaisse", { replace: true });
//       //     break;
//       //   case "cuisinier":
//       //     navigate("/personnelCuisine", { replace: true });
//       //     break;
//       //   case "accueil":
//       //     navigate("/personnelAccueil", { replace: true });
//       //     break;
//       //   default:
//       //     navigate("/", { replace: true });
//       //     break;
//       // }
//       navigate("/accuei")
//     }
//     } else {
//       console.warn(" Token ou rôle manquant");
//       navigate("/", { replace: true });
//     }

//     setLoading(false);
//   }, [location, navigate, setToken, setUser]);

//   if (loading) return <div>Connexion en cours...</div>;

//   return null;
// }

// export default ConnexionGoogle;


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