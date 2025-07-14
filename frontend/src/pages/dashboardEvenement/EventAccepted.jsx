import React, { useState, useEffect } from 'react';
import { getMyEvents } from '../../services/evenementServ';
import { useStateContext } from '../../context/ContextProvider';
import Modal from '../../components/Modal/EventModal';
import DeleteEventButton from '../../util/DeleteEvenement';
const EventAccept = () => {
  const { token } = useStateContext();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setError("Aucun token d'authentification trouvé.");
      return;
    }

    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const data = await getMyEvents(token);
        setEvents(data);
        setError(null);
      } catch (error) {
        console.error('Erreur lors de la récupération des événements:', error);
        setError("Erreur lors du chargement des événements.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [token]);

  const openModal = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8 text-pink-600">Mes Événements</h1>

      {/* Indicateur de chargement */}
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <svg
            className="animate-spin h-10 w-10 text-pink-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <p className="text-red-600 bg-red-50 py-3 px-4 rounded-xl mb-6 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {error}
        </p>
      )}

      {/* Liste des événements */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
            >
              <h2 className="text-xl font-semibold text-pink-600">{event.nom}</h2>
              <p className="text-gray-600">Type: {event.type}</p>
              <p className="text-gray-600">Thème: {event.theme}</p>
              <p className="text-gray-600">
                Date:{' '}
                {new Date(event.date).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              <p className="text-gray-600">Lieu: {event.location.nom}</p>
              <p className="text-gray-600">Salle: {event.salle.nom}</p>
              <button
                onClick={() => openModal(event)}
                className="mt-4 bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 transition-colors duration-200"
                aria-label={`Voir les tables pour l'événement ${event.nom}`}
              >
                Voir les tables
              </button>
              <DeleteEventButton eventId={event.id} onDeleted={(deletedId) => setEvents(events.filter(e => e.id !== deletedId))} />
            </div>
          ))}
        </div>
      )}

      {/* Modale pour afficher les tables */}
      {selectedEvent && (
        <Modal isOpen={isModalOpen} onClose={closeModal} event={selectedEvent} />
      )}
    </div>
  );
};

export default EventAccept;