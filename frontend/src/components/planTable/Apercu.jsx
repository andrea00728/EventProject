import React, { useEffect, useState } from "react";
import GestionPlan from "../../components/planTable/GestionPlan";
import { getMyEvents } from "../../services/evenementServ";
import { Tabs, Tab } from "@mui/material";
import { useStateContext } from "../../context/ContextProvider";

export default function Apercu() {
  const { token } = useStateContext();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [eventError, setEventError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!token) {
        setEventError("Veuillez vous connecter pour voir vos événements.");
        setIsLoadingEvents(false);
        return;
      }
      setIsLoadingEvents(true);
      try {
        const data = await getMyEvents(token);
        console.log("Events Response:", data);
        if (Array.isArray(data)) {
          setEvents(data);
          setEventError(null);
        } else {
          setEvents([]);
          setEventError("Les événements reçus ne sont pas au format attendu.");
        }
      } catch (err) {
        setEventError(
          err.response?.data?.message || "Impossible de charger les événements."
        );
        console.error("Erreur lors du chargement des événements", err);
        setEvents([]);
      } finally {
        setIsLoadingEvents(false);
      }
    };
    fetchEvents();
  }, [token]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-8 text-center text-gray-900">Graphique</h1>

      <div className="flex flex-col mb-6">
        <h2 className="text-sm font-medium text-gray-600 mb-2">Sélectionner un événement</h2>
        {isLoadingEvents ? (
          <p className="text-gray-600">Chargement des événements...</p>
        ) : eventError ? (
          <p className="text-red-500">{eventError}</p>
        ) : events.length === 0 ? (
          <p className="text-gray-600">Aucun événement trouvé. Créez un événement d’abord.</p>
        ) : (
          <Tabs
            value={selectedEvent ? events.findIndex(event => event.id === selectedEvent.id) : false}
            onChange={(e, newValue) => setSelectedEvent(events[newValue])}
            variant="scrollable"
            className="mb-6 border-b border-gray-200"
            TabIndicatorProps={{ style: { backgroundColor: '#6b48ff' } }}
          >
            {events.map((event) => (
              <Tab
                key={event.id}
                label={event.nom}
                className={`text-sm font-medium ${selectedEvent?.id === event.id ? 'text-purple-600' : 'text-gray-600 hover:text-gray-800'}`}
                sx={{
                  minWidth: 'auto',
                  padding: '8px 16px',
                  '&.Mui-selected': { backgroundColor: '#f0f0ff', borderRadius: '4px 4px 0 0' },
                  '&:hover': { backgroundColor: '#e0e0ff' },
                }}
              />
            ))}
          </Tabs>
        )}
      </div>

      {selectedEvent && (
        <>
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            Plan de salle pour : {selectedEvent.nom}
          </h2>
          <GestionPlan selectedEventId={selectedEvent.id} />
        </>
      )}
    </div>
  );
}