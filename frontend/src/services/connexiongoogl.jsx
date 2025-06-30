import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStateContext } from '../context/ContextProvider';

function Connnexiongoogle() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setToken } = useStateContext();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Location search brut :", location.search); // Log pour l'URL complète
    console.log("Location hash brut :", location.hash); // Log pour vérifier hash
    const searchParams = new URLSearchParams(location.search); // Lire depuis location.search
    const token = searchParams.get('token');
    const name = searchParams.get('name');
    const email = searchParams.get('email');
    const photo = searchParams.get('photo');

    console.log("Token extrait :", token);
    console.log("Paramètres extraits :", { name, email, photo });

    if (token) {
      setToken(token);
      setUser({
        name: decodeURIComponent(name || 'Utilisateur inconnu'),
        email: decodeURIComponent(email || ''),
        photo: decodeURIComponent(photo || '')
      });
      console.log("Token défini dans le contexte :", token);
      navigate('/accueil', { replace: true });
    } else {
      console.error("Aucun token trouvé dans l'URL de callback");
      navigate('/pagepublic', { replace: true });
    }
    setLoading(false);
  }, [location, navigate, setToken, setUser]);

  if (loading) return <div>Connexion en cours...</div>;

  return null;
}

export default Connnexiongoogle;