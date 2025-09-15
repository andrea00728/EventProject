import React, { useEffect, useState } from 'react';
import { getMyEvents } from '../services/evenementServ';
import { createInvitation } from '../services/invitationService';
import { eventNames } from 'resium';

export default function InvitationLayout({ token }) {
  const [evenements, setEvenements] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [message, setMessage] = useState('');

  // Récupération des événements au montage du composant
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
  

  // Gestion de l'envoi d'invitation
  const handleEnvoyer = async (eventId) => {
    setLoadingId(eventId);
    setMessage('');
    try {
      await createInvitation(eventId, token);

      // Récupère le nom de l'événement depuis ton state 'evenements'
      const event = evenements.find(e => e.id === eventId);
      const eventName = event ? event.nom : 'inconnu';

      setMessage(`Invitation envoyée pour l'événement ${eventName} ! ✅`);
    } catch (err) {
      setMessage('Erreur lors de l\'envoi de l\'invitation.');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="h-screen  overflow-auto bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* En-tête avec style élégant */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mb-8 shadow-2xl">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <h1 className="text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Invitations aux Événements
          </h1>
          <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-6 rounded-full"></div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Gérez et envoyez vos invitations d'événements avec style et efficacité
          </p>
        </div>

        {/* Message de notification */}
        {message && (
          <div className="mb-12 max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${message.includes('✅') ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                    {message.includes('✅') ? (
                      <ErrorRounded className='text-red-700'/>
                    ) : (
                      <Check className='text-green-500'/>
                    )}
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-lg font-medium text-gray-800">{message}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Grille des événements */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {evenements.map((event, index) => (
            <div
              key={event.id}
              className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 overflow-hidden group"
            >
              {/* Header avec alternance de couleurs */}
              <div className={`h-2 ${index % 2 === 0 ? 'bg-blue-500' : 'bg-purple-500'
                }`}></div>

              {/* Contenu de la carte */}
              <div className="p-8">

                {/* En-tête de la carte */}
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-12 h-12 ${index % 2 === 0 ? 'bg-blue-500' : 'bg-purple-500'
                    } rounded-xl flex items-center justify-center shadow-lg`}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>

                {/* Titre de l'événement */}
                <h3 className="text-2xl font-bold text-gray-900 mb-6 leading-tight group-hover:text-blue-600 transition-colors duration-300">
                  {event.nom}
                </h3>

                {/* Informations de date */}
                <div className="bg-gray-50 rounded-xl p-4 mb-8 border border-gray-200">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 ${index % 2 === 0 ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                      } rounded-lg flex items-center justify-center mr-4`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {new Date(event.date).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(event.date).toLocaleDateString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bouton d'invitation */}
                <button
                  onClick={() => handleEnvoyer(event.id)}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform active:scale-95 shadow-lg hover:shadow-xl ${loadingId === event.id
                      ? 'bg-gray-400 cursor-not-allowed'
                      : index % 2 === 0
                        ? 'bg-blue-500 hover:bg-blue-600'
                        : 'bg-purple-500 hover:bg-purple-600'
                    } relative overflow-hidden`}
                  disabled={loadingId === event.id}
                >
                  {/* Animation de chargement */}
                  {loadingId === event.id && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}

                  <span className={loadingId === event.id ? 'opacity-0' : 'opacity-100'}>
                    {loadingId === event.id ? '' : (
                      <div className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Envoyer l'invitation
                      </div>
                    )}
                  </span>
                </button>
              </div>

              {/* Effet de bordure au hover */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl border-2 ${index % 2 === 0 ? 'border-blue-500' : 'border-purple-500'
                } pointer-events-none`}></div>
            </div>
          ))}
        </div>

        {/* État vide */}
        {evenements.length === 0 && !message && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Aucun événement trouvé</h3>
            <p className="text-xl text-gray-600">Vos événements apparaîtront ici une fois créés.</p>
          </div>
        )}
      </div>
    </div>
  );
}