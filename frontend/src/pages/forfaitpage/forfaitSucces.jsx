import React, { useEffect, useState } from 'react';
import { getSuccessForfait } from '../../services/forfaitService';
import { useStateContext } from '../../context/ContextProvider';
import { useLocation, useNavigate } from 'react-router-dom';

const ForfaitSuccess = () => {
  const [message, setMessage] = useState('');
  const [subscriptionId, setSubscriptionId] = useState(null);
  const { token } = useStateContext();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const subId = params.get("subscription_id");

    if (!subId) {
      setMessage("Aucun identifiant de souscription trouvé.");
      return;
    }

    setSubscriptionId(subId); // stocké séparément

  }, [location.search]);

  useEffect(() => {
    const fetchConfirmation = async () => {
      if (!subscriptionId || !token) return;

      try {
        const res = await getSuccessForfait(token, subscriptionId);
        if (res.message) {
          setMessage(res.message);
        } else {
          setMessage("Le forfait a été activé, mais aucun message n'a été retourné.");
        }
      } catch (error) {
        console.error('Erreur de confirmation', error);
        setMessage("Erreur lors de la confirmation du forfait.");
      }
    };

    fetchConfirmation();
  }, [token, subscriptionId]);

  return (
    <div className="max-w-xl mx-auto mt-10">
      {message && (
        <div className="bg-green-100 border border-green-400 text-green-800 px-6 py-4 rounded-lg shadow-md text-center">
          {message}
        </div>
      )}

      {!token && (
        <div className="text-center mt-6">
          <p className="text-red-600 mb-2">Vous devez être connecté pour activer votre forfait.</p>
          <button
            onClick={() => navigate('/login')} // ou ta page de connexion Google
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Se connecter
          </button>
        </div>
      )}
    </div>
  );
};

export default ForfaitSuccess;
