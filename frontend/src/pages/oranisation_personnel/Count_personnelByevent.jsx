import React, { useState, useEffect } from 'react';
import { CountPersonnelByEvent } from '../../services/personnel_service';
import { getMyEvents } from '../../services/evenementServ';
import { useStateContext } from '../../context/ContextProvider';
import ListePersonnel from './Listepersonnel';

export default function PersonnelCountDashboard() {
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [selectedEventName, setSelectedEventName] = useState('');
  const [count, setCount] = useState(null);
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
    setCount(null);
    setError('');

    try {
      const result = await CountPersonnelByEvent(event.id, token);
      setCount(result.count);
    } catch (err) {
      setError('Erreur lors du comptage du personnel.');
    } finally {
      setLoadingCount(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50  h-screen rounded-lg shadow-md">

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">
          {error}
        </div>
      )}

      {/* Grille horizontale des événements */}
      <div className="overflow-x-auto mb-8">
        <div className="flex gap-4 w-max">
          {loadingEvents ? (
            <div className="text-gray-500">Chargement des événements...</div>
          ) : (
            events.map((event) => (
              <button
                key={event.id}
                onClick={() => handleEventClick(event)}
                className={`min-w-[180px] px-4 py-3 rounded-lg shadow text-sm font-medium transition whitespace-nowrap ${
                  selectedEventId === event.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-800 hover:bg-gray-100'
                }`}
              >
                {event.nom || `Événement ${event.id}`}
              </button>
            ))
          )}
        </div>
      </div>
      {/* Liste du personnel */}
      {selectedEventId && (
        <ListePersonnel eventId={selectedEventId} token={token} />
      )}
    </div>
  );
}