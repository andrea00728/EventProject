import { useNavigate } from 'react-router-dom';
import { useStateContext } from '../context/ContextProvider';

export default function LogoutButton() {
  const { setUser, setToken } = useStateContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Supprimez TOUS les tokens du localStorage
    localStorage.removeItem('ACCESS_TOKEN');
    localStorage.removeItem('REFRESH_TOKEN'); // <-- Ligne essentielle
    localStorage.removeItem('USER');

    // Réinitialisez l'état du contexte
    setToken(null);
    setUser(null);

    // Redirigez l'utilisateur vers la page publique
    navigate('/pagepublic', { replace: true });
  };

  return (
    <button onClick={handleLogout}>
      Déconnexion
    </button>
  );
}