
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider";

function ConnexionGoogle() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setToken } = useStateContext();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get("token");
    const name = searchParams.get("name");
    const email = searchParams.get("email");
    const photo = searchParams.get("photo");
    const role = searchParams.get("role"); 

    console.log("🔐 Token extrait :", token);
    console.log("👤 Infos :", { name, email, photo, role });

    if (token && email && name && role) {
    
      setToken(token);
      setUser({
        name: decodeURIComponent(name),
        email: decodeURIComponent(email),
        photo: decodeURIComponent(photo || ""),
        role: decodeURIComponent(role),
      });
  
      switch (decodeURIComponent(role)) {
        case "organisateur":
          navigate("/accueil", { replace: true });
          break;
        case "caissier":
          navigate("/personnelCaisse", { replace: true });
          break;
        case "cuisinier":
          navigate("/personnelCuisine", { replace: true });
          break;
        case "accueil":
          navigate("/personnelAccueil", { replace: true });
          break;
        default:
          navigate("/pagepublic", { replace: true });
          break;
      }
    } else {
      console.warn("⚠️ Token ou rôle manquant");
      navigate("/pagepublic", { replace: true });
    }

    setLoading(false);
  }, [location, navigate, setToken, setUser]);

  if (loading) return <div>Connexion en cours...</div>;

  return null;
}

export default ConnexionGoogle;
