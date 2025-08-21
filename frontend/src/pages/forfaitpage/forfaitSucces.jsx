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
    const subId = params.get('subscription_id');

    if (!subId) {
      setMessage('Aucun identifiant de souscription trouvé.');
      return;
    }

    setSubscriptionId(subId);
  }, [location.search]);

  useEffect(() => {
    const fetchConfirmation = async () => {
      if (!subscriptionId || !token) return;

      try {
        const res = await getSuccessForfait(token, subscriptionId);
        setMessage(res.message);
        // Rediriger vers la page des forfaits après 3 secondes
        setTimeout(() => navigate('/forfaits'), 1000);
           window.dispatchEvent(new Event('forfaitUpdated'));
      } catch (error) {
        console.error('Erreur de confirmation', error);
        setMessage('Erreur lors de la confirmation du forfait.');
      }
    };

    fetchConfirmation();
  }, [token, subscriptionId, navigate]);

  return (
    <div className="max-w-xl mx-auto mt-10 p-6">
      {message && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg shadow-md text-center">
          <p className="font-semibold">{message}</p>
        </div>
      )}

      {!token && (
        <div className="text-center mt-6">
          <p className="text-red-600 mb-4">Vous devez être connecté pour activer votre forfait.</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Se connecter
          </button>
        </div>
      )}
    </div>
  );
};

export default ForfaitSuccess;