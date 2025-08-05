import React, { useEffect, useState } from "react";
import axios from "axios";
import InviteForm from "./choixModInvite/inviteForm.jsx";

const PublicEvents = () => {
  const [evenements, setEvenements] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchEvenements = async () => {
      try {
        const response = await axios.get("http://api.mastertable.site/evenements/publics");
        setEvenements(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des événements :", error);
      }
    };

    fetchEvenements();
  }, []);

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <main className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-center text-indigo-700 mb-8">Événements Publics</h1>

        {evenements.length === 0 ? (
          <p className="text-center text-gray-500">Aucun événement public disponible pour le moment.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {evenements.map((event) => (
              <div
                key={event.id}
                onClick={() => handleEventClick(event)}
                className="cursor-pointer group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 overflow-hidden transform hover:-translate-y-1"
              >
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-indigo-700 group-hover:text-indigo-900">
                    {event.nom}
                  </h2>
                  <p className="text-gray-600 mt-2">
                    <span className="font-semibold">Type :</span> {event.type}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold">Thème :</span> {event.theme}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold">Date :</span>{" "}
                    {new Date(event.date).toLocaleDateString("fr-FR", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-gray-600"><strong>Lieu :</strong> {event.location?.nom || "Non précisé"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal simple maison */}
      {showModal && selectedEvent && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        onClick={handleCloseModal}
      >
        <div
          className="bg-white rounded-xl p-8 max-w-4xl w-full shadow-lg relative max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleCloseModal}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-3xl font-bold leading-none"
            aria-label="Fermer modal"
          >
            &times;
          </button>
          <h2 className="text-3xl font-bold mb-6 text-indigo-700">
            Invitation pour : {selectedEvent.nom}
          </h2>
          <InviteForm onBack={handleCloseModal} eventId={selectedEvent.id} />
        </div>
      </div>
    )}

        </div>
  );
};

export default PublicEvents;
