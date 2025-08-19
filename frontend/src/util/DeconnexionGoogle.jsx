import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStateContext } from '../context/ContextProvider';

export default function LogoutButton() {
  const { setUser, setToken, user, token } = useStateContext();
  const navigate = useNavigate();

const handleLogout = () => {
  console.log("Déconnexion lancée");
  setToken(null);
  setUser(null);
  localStorage.removeItem('ACCESS_TOKEN');
  localStorage.removeItem('USER');
  console.log("ACCESS_TOKEN supprimé", localStorage.getItem('ACCESS_TOKEN'));
  console.log("USER supprimé", localStorage.getItem('USER'));
   window.location.href = '/pagepublic';
};


  useEffect(() => {
    if (!token && !user) {
      navigate('/pagepublic', { replace: true });
    }
  }, [token, user, navigate]);

  return (
    <button onClick={handleLogout}>
      Déconnexion
    </button>
  );
}
