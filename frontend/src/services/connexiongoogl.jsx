
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
  const isInPersonnel = searchParams.get("isInPersonnel")?.toLowerCase() === "true";

  if (token && email && name && role) {
    setToken(token);
    setUser({
      name: decodeURIComponent(name),
      email: decodeURIComponent(email),
      photo: decodeURIComponent(photo || ""),
      role: decodeURIComponent(role),
      isInPersonnel,
    });

    if (isInPersonnel) {
      navigate("/choix-role", { replace: true });
    } else {
      navigate("/pagepublic", { replace: true });
    }
  } else {
    navigate("/pagepublic", { replace: true });
  }

  setLoading(false);
}, []); // ✅ exécution unique

  if (loading) return <div>Connexion en cours...</div>;

  return null;
}

export default ConnexionGoogle;
