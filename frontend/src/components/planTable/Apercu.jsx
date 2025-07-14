import React, { useEffect, useState } from "react";
import GestionPlan from "../../components/planTable/GestionPlan";
import { getMyEvents } from "../../services/evenementServ";

export default function Apercu() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);

  useEffect(() => {
    // Récupère les événements depuis ton service
    const fetchEvents = async () => {
      try {
        const data = await getMyEvents();
        setEvents(data);
      } catch (err) {
        console.error("Erreur lors du chargement des événements", err);
      }
    };
    fetchEvents();
  }, []);

 return (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Sélectionner un événement</h1>

    {events.length === 0 ? (
      <p className="text-gray-600">Aucun événement trouvé. Créez un événement d’abord.</p>
    ) : (
      <div className="flex gap-4 flex-wrap mb-6">
        {events.map((event) => (
          <button
            key={event.id}
            onClick={() => setSelectedEventId(event.id)}
            className={`py-2 px-4 rounded ${
              selectedEventId === event.id ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {event.nom}
          </button>
        ))}
      </div>
    )}

    {selectedEventId && (
      <>
        <h2 className="text-xl font-semibold mb-2">
          Plan de salle pour : {events.find((e) => e.id === selectedEventId)?.nom}
        </h2>
        <GestionPlan selectedEventId={selectedEventId} />
      </>
    )}
  </div>
);

}
