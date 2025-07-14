import { useState, useEffect } from "react";
import { getMyEvents } from "../../services/evenementServ";
import { createTableByIdevent } from "../../services/tableService";
import { useStateContext } from "../../context/ContextProvider";

export default function Tablecreation() {
  const { token } = useStateContext();
  const [form, setForm] = useState({ numero: "", capacite: "", type: "ronde", eventId: 0 });
  const [error, setError] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [eventError, setEventError] = useState(null);

  // Récupérer les événements de l'utilisateur
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoadingEvents(true);
      try {
        const data = await getMyEvents(token);
        setEvents(data);
      } catch (err) {
        setEventError(
          err.response && err.response.data
            ? err.response.data.message
            : "Impossible de charger les événements"
        );
        console.error("Erreur chargement événements:", err);
      } finally {
        setIsLoadingEvents(false);
      }
    };
    if (token) {
      fetchEvents();
    }
  }, [token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const selectEvent = (event) => {
    setSelectedEvent(event);
    setForm({ ...form, eventId: event.id });
    setIsModalOpen(false);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setShowAlert(false);
    setSuccessMessage(null);

    if (!form.eventId) {
      setError("Veuillez sélectionner un événement");
      return;
    }

    try {
      await createTableByIdevent(
        {
          numero: parseInt(form.numero),
          capacite: parseInt(form.capacite),
          eventId: form.eventId,
          type: form.type,
          position: { left: 100, top: 200 },
        },
        token
      );
      setForm({ numero: "", capacite: "", type: "ronde", eventId: 0 });
      setSelectedEvent(null);
      setSuccessMessage("Table créée avec succès");
    } catch (err) {
      if (
        err.response &&
        err.response.data &&
        err.response.data.message &&
        err.response.data.message.includes("déjà utilisé")
      ) {
        setShowAlert(true);
      } else {
        // Afficher un message d'erreur personnalisé si le serveur ne donne pas de détail
        setError(
          err.response && err.response.data && err.response.data.message
            ? err.response.data.message
            : "Erreur lors de la création de la table. Veuillez réessayer."
            
        );
      }
    }
  };

  const closeAlert = () => {
    setShowAlert(false);
  };

  const closeSuccess = () => {
    setSuccessMessage(null);
  };

  return (
    <div className="relative">
      {/* Formulaire de création de table */}
      <form
        onSubmit={onSubmit}
        className="p-8 bg-gray-50 max-w-md mx-auto shadow-lg rounded-xl mb-10 border border-gray-100"
      >
        <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">Créer une Table</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label htmlFor="numero" className="text-gray-700 font-medium mb-2 text-sm">
              Numéro de Table
            </label>
            <input
              id="numero"
              name="numero"
              value={form.numero}
              onChange={handleChange}
              placeholder="Ex: 1, 2, G1, G2..."
              required
              className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all duration-200"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="capacite" className="text-gray-700 font-medium mb-2 text-sm">
              Capacité
            </label>
            <input
              id="capacite"
              name="capacite"
              type="number"
              value={form.capacite}
              onChange={handleChange}
              placeholder="Ex: 4, 6, 8"
              required
              min="1"
              className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all duration-200"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="type" className="text-gray-700 font-medium mb-2 text-sm">
              Type de Table
            </label>
            <select
              id="type"
              name="type"
              value={form.type}
              onChange={handleChange}
              required
              className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all duration-200"
            >
              <option value="ronde">Ronde</option>
              <option value="carree">Carrée</option>
              <option value="rectangle">Rectangle</option>
              <option value="ovale">Ovale</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-gray-700 font-medium mb-2 text-sm">Événement Associé</label>
            <div
              className="flex items-center border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-indigo-600 cursor-pointer transition-all duration-200"
              onClick={() => setIsModalOpen(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setIsModalOpen(true)}
            >
              <input
                type="text"
                value={selectedEvent ? `${selectedEvent.nom} (${new Date(selectedEvent.date).toLocaleDateString("fr-FR")})` : "Sélectionner un événement"}
                readOnly
                placeholder="Cliquez pour sélectionner un événement"
                className="flex-grow bg-transparent outline-none cursor-pointer text-gray-900 placeholder-gray-400"
              />
              <button
                type="button"
                className="ml-2 text-gray-500 hover:text-indigo-600 focus:outline-none transition-colors duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
        {error && (
          <p className="text-red-500 mt-6 text-center bg-red-50 py-3 rounded-xl flex items-center justify-center">
            <svg
              className="h-5 w-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
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
        <div className="mt-8">
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold py-3 rounded-lg hover:from-indigo-700 hover:to-indigo-800 focus:ring-2 focus:ring-indigo-600 transition-all duration-200"
          >
            Ajouter Table
          </button>
        </div>
      </form>

      {/* Modal pour sélectionner un événement */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50 transition-opacity duration-300 ease-in-out">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-4xl mx-auto transform transition-all duration-300 ease-out scale-100 animate-fadeIn">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 rounded-full p-2 transition-colors duration-200 cursor-pointer"
            >
              ×
            </button>
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center font-sans">
              Sélectionner un événement
            </h3>
            <div className="w-[100%] h-[400px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {isLoadingEvents ? (
                <p className="p-6 text-center text-gray-500 bg-gray-50 rounded-xl">
                  Chargement des événements...
                </p>
              ) : eventError ? (
                <p className="p-6 text-center text-red-500 bg-red-50 rounded-xl">
                  {eventError}
                </p>
              ) : events.length === 0 ? (
                <p className="p-6 text-center text-gray-500 bg-gray-50 rounded-xl">
                  Aucun événement disponible.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="bg-gradient-to-br from-gray-800 to-gray-900 text-white p-6 rounded-xl shadow-lg hover:shadow-xl hover:from-gray-700 hover:to-gray-800 cursor-pointer transition-all duration-300 transform hover:-translate-y-1"
                      onClick={() => selectEvent(event)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && selectEvent(event)}
                    >
                      <p className="font-semibold text-lg mb-2">{event.nom}</p>
                      <p className="text-sm text-gray-200">
                        Date: {new Date(event.date).toLocaleDateString("fr-FR")}
                      </p>
                      {event.description && (
                        <p className="text-xs text-gray-300 mt-2 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Alerte pour numéro de table déjà utilisé */}
      {showAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-yellow-700">Avertissement</h3>
              <button
                onClick={closeAlert}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <p className="text-gray-900 mb-4">Le numéro de table est déjà utilisé dans cet événement.</p>
            <button
              onClick={closeAlert}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold py-2 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-colors duration-200"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Alerte pour création réussie */}
      {successMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-green-700">Succès</h3>
              <button
                onClick={closeSuccess}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <p className="text-gray-900 mb-4">{successMessage}</p>
            <button
              onClick={closeSuccess}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-colors duration-200"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}