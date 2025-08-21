import React, { useState, useEffect } from 'react';
import { CountPersonnelByEvent } from '../../services/personnel_service';
import { getMyEvents } from '../../services/evenementServ';
import { useStateContext } from '../../context/ContextProvider';
import ListePersonnel from './Listepersonnel';

export default function PersonnelCountDashboard() {
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [selectedEventName, setSelectedEventName] = useState('');
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [error, setError] = useState('');
  const { token } = useStateContext();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getMyEvents(token);
        setEvents(data);
        if(data.length > 0) {
          setSelectedEventId(data[0].id);
          setSelectedEventName(data[0].nom || `Événement ${data[0].id}`);
        }
      } catch (err) {
        setError('Erreur lors de la récupération des événements.');
      } finally {
        setLoadingEvents(false);
      }
    };

    if (token) fetchEvents();
  }, [token]);

  const handleEventClick = async (event) => {
    setSelectedEventId(event.id);
    setSelectedEventName(event.nom || `Événement ${event.id}`);
    setError('');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header avec sélection d'événements */}
      <div className="flex-shrink-0 p-6 bg-white border-b border-gray-200">
        <h1 className="text-3xl font-bold text-indigo-700 mb-6">Dashboard Personnel</h1>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="flex gap-3 overflow-x-auto pb-2">
          {loadingEvents ? (
            <div className="text-gray-500">Chargement des événements...</div>
          ) : (
            events.map((event) => (
              <button
                key={event.id}
                onClick={() => handleEventClick(event)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  selectedEventId === event.id
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {event.nom || `Événement ${event.id}`}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 overflow-y-auto">
        {selectedEventId && (
          <div className="p-6">
            <ListePersonnel eventId={selectedEventId} token={token} />
          </div>
        )}
      </div>
    </div>
  );
}
