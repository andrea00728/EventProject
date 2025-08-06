import React, { useEffect, useState } from 'react';
import { getMyEvents } from '../services/evenementServ';
import { createInvitation } from '../services/invitationService';

export default function InvitationLayout({ token }) {
  const [evenements, setEvenements] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const getEvenements = async () => {
      try {
        const data = await getMyEvents(token);
        setEvenements(data);
      } catch (err) {
        console.error('Erreur de récupération des événements', err);
        setMessage("Impossible de charger les événements.");
      }
    };
    getEvenements();
  }, [token]);

  const handleEnvoyer = async (eventId) => {
    setLoadingId(eventId);
    setMessage('');
    try {
      await createInvitation(eventId, token);
      setMessage(`✅ Invitation envoyée pour l’événement ${eventId}`);
    } catch (err) {
      setMessage('❌ Erreur lors de l’envoi de l’invitation.');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-center text-indigo-600 mb-8"> Invitations aux Événements</h2>

      {message && (
        <div className="mb-6 px-4 py-3 rounded-lg text-sm font-medium text-white bg-indigo-500 shadow">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {evenements.map((event) => (
          <div
            key={event.id}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition duration-300 border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{event.nom}</h3>
            <p className="text-sm text-gray-500 mb-4">
               {new Date(event.date).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            <button
              onClick={() => handleEnvoyer(event.id)}
              className={`w-full py-2 px-4 rounded text-white font-medium transition duration-200 ${
                loadingId === event.id ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
              disabled={loadingId === event.id}
            >
              {loadingId === event.id ? 'Envoi en cours…' : 'Envoyer Invitation'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}