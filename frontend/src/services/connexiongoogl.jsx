
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
//       //     navigate("/pagepublic", { replace: true });
//       //     break;
//       // }
//       navigate("/accuei")
//     }
//     } else {
//       console.warn(" Token ou rôle manquant");
//       navigate("/pagepublic", { replace: true });
//     }

//     setLoading(false);
//   }, [location, navigate, setToken, setUser]);

//   if (loading) return <div>Connexion en cours...</div>;

//   return null;
// }

// export default ConnexionGoogle;


import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider";

function ConnexionGoogle() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setToken, setRefreshToken } = useStateContext(); // N'oubliez pas d'importer setRefreshToken
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const accessToken = searchParams.get("token");
    const refreshToken = searchParams.get("refresh_token"); // <-- Nouvelle ligne
    const name = searchParams.get("name");
    const email = searchParams.get("email");
    const photo = searchParams.get("photo");
    const role = searchParams.get("role");

    console.log("🔐 Access Token extrait :", accessToken);
    console.log("🔄 Refresh Token extrait :", refreshToken); // <-- Ajout de ce log
    console.log("👤 Infos :", { name, email, photo, role });
    
    // ... le reste de votre logique
    const isInPersonnel = searchParams.get("isInPersonnel")?.toLowerCase() === "true";

    if (accessToken && refreshToken && email && name && role) {
      // Mettez à jour les deux tokens dans votre contexte
      setToken(accessToken);
      setRefreshToken(refreshToken); // <-- C'est la ligne clé !

      setUser({
        name: decodeURIComponent(name),
        email: decodeURIComponent(email),
        photo: decodeURIComponent(photo || ""),
        role: decodeURIComponent(role),
        isInPersonnel,
      });

      if (isInPersonnel) {
        navigate("/choix-role");
      } else {
        navigate("/accueil");
      }
    } else {
      console.warn("Jeton ou informations utilisateur manquants");
      navigate("/pagepublic", { replace: true });
    }

    setLoading(false);
  }, [location, navigate, setToken, setUser, setRefreshToken]); // N'oubliez pas de l'ajouter dans les dépendances !

  if (loading) return <div>Connexion en cours...</div>;

  return null;
}

export default ConnexionGoogle;