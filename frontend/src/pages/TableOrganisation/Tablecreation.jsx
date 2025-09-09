import { useState, useEffect } from "react";
import { getMyEvents } from "../../services/evenementServ";
import { useStateContext } from "../../context/ContextProvider";
import { getMaxCapacity } from "../../services/controll_champs/controll_champs";
import { createTable } from "../../services/tableService";

export default function Tablecreation() {
  const { isAuthenticated } = useStateContext();

  // Formulaire
  const [form, setForm] = useState({
    capacite: "",
    type: "ronde",
    nombre: "",
    noms: [],
    eventId: 0
  });

  // États pour alertes et UI
  const [error, setError] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // États pour événements
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [eventError, setEventError] = useState(null);

  // Charger événements de l'utilisateur
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoadingEvents(true);
      try {
        const data = await getMyEvents();
        setEvents(data);
      } catch (err) {
        setEventError(
          err.response?.data?.message || "Impossible de charger les événements"
        );
      } finally {
        setIsLoadingEvents(false);
      }
    };

    if (isAuthenticated) fetchEvents();
  }, [isAuthenticated]);

  // Gestion changement du nombre → crée un tableau de noms vides
  const handleNombreChange = (e) => {
    const nb = Number(e.target.value);
    setForm((prev) => ({
      ...prev,
      nombre: nb,
      noms: Array(nb).fill("")
    }));
  };

  // Gestion changement d’un nom spécifique
  const handleNomChange = (index, value) => {
    const updatedNoms = [...form.noms];
    updatedNoms[index] = value;
    setForm((prev) => ({ ...prev, noms: updatedNoms }));
  };

  // Gestion des autres champs (capacite, type)
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "capacite") {
      const numericValue = parseInt(value, 10);
      const max = getMaxCapacity(form.type);
      if (numericValue > max) {
        setError(`La capacité maximale pour une table ${form.type} est ${max}`);
        return;
      } else {
        setError(null);
      }
      setForm({ ...form, [name]: numericValue });
      return;
    }

    if (name === "type") {
      const max = getMaxCapacity(value);
      const newCapacite = Math.min(form.capacite, max);
      if (form.capacite > max) {
        setError(`Capacité ajustée à ${newCapacite} pour le type ${value}`);
      } else {
        setError(null);
      }
      setForm({ ...form, [name]: value, capacite: newCapacite });
      return;
    }

    setForm({ ...form, [name]: value });
  };

  // Sélectionner un événement
  const selectEvent = (event) => {
    setSelectedEvent(event);
    setForm((prev) => ({ ...prev, eventId: event.id }));
    setIsModalOpen(false);
  };

  // Soumission du formulaire
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
      const nomsFinal = form.noms.map((nom, index) =>
        nom && nom.trim() !== "" ? nom : `Table ${index + 1}`
      );

      const formDataArray = nomsFinal.map((nom) => ({
        nom,
        capacite: form.capacite,
        type: form.type,
        eventId: form.eventId
      }));

      await Promise.all(formDataArray.map((t) => createTable(t)));

      setForm({ capacite: "", type: "ronde", nombre: "", noms: [], eventId: 0 });
      setSelectedEvent(null);
      setSuccessMessage("Tables créées avec succès");
    } catch (err) {
      if (err.response?.data?.message?.includes("déjà utilisé")) {
        setShowAlert(true);
      } else {
        setError(err.response?.data?.message || "Erreur lors de la création des tables");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <form
        onSubmit={onSubmit}
        className="p-8 bg-white max-w-lg w-full mx-auto shadow-2xl rounded-2xl border border-gray-200 transition-all duration-300"
      >
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Créer une Table</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Capacité */}
          <div className="flex flex-col">
            <label htmlFor="capacite" className="text-gray-700 font-semibold mb-2 text-sm">
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
              className="border border-gray-300 bg-gray-50 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            />
            {error && <p className="text-red-500 text-sm mt-2 animate-pulse">{error}</p>}
          </div>

          {/* Nombre */}
          <div className="flex flex-col">
            <label htmlFor="nombre" className="text-gray-700 font-semibold mb-2 text-sm">
              Nombre de tables
            </label>
            <input
              id="nombre"
              name="nombre"
              type="number"
              value={form.nombre}
              onChange={handleNombreChange}
              placeholder="Ex: 4"
              required
              min="1"
              className="border border-gray-300 bg-gray-50 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            />
          </div>

          {/* Type */}
          <div className="flex flex-col">
            <label htmlFor="type" className="text-gray-700 font-semibold mb-2 text-sm">
              Type de Table
            </label>
            <select
              id="type"
              name="type"
              value={form.type}
              onChange={handleChange}
              required
              className="border border-gray-300 bg-gray-50 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            >
              <option value="ronde">Ronde</option>
              <option value="carree">Carrée</option>
              <option value="rectangle">Rectangle</option>
              <option value="ovale">Ovale</option>
            </select>
          </div>

          {/* Événement */}
          <div className="flex flex-col">
            <label className="text-gray-700 font-semibold mb-2 text-sm">Événement Associé</label>
            <div
              className="flex items-center border border-gray-300 bg-gray-50 rounded-lg px-4 py-3 cursor-pointer hover:bg-gray-100 transition-all duration-200"
              onClick={() => setIsModalOpen(true)}
            >
              <input
                type="text"
                value={selectedEvent ? `${selectedEvent.nom} (${new Date(selectedEvent.date).toLocaleDateString("fr-FR")})` : "Sélectionner un événement"}
                readOnly
                className="flex-grow bg-transparent outline-none cursor-pointer text-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Inputs pour chaque nom */}
        {form.noms.length > 0 && (
          <div className="mt-8 space-y-4">
            {form.noms.map((nom, index) => (
              <div key={index} className="flex flex-col">
                <label className="text-gray-700 font-semibold mb-2 text-sm">
                  Nom Table {index + 1}
                </label>
                <input
                  value={nom}
                  onChange={(e) => handleNomChange(index, e.target.value)}
                  placeholder={`Table ${index + 1}`}
                  className="border border-gray-300 bg-gray-50 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                />
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-red-500 mt-6 text-center font-medium">{error}</p>}

        <div className="mt-8">
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-800 text-white font-semibold py-3 rounded-lg hover:from-indigo-700 hover:to-indigo-900 transition-all duration-300"
          >
            Ajouter Table
          </button>
        </div>
      </form>

      {/* Modal événements */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-500">
          <div className="bg-gradient-to-b from-white to-gray-50 rounded-2xl p-6 max-w-5xl w-full mx-4 relative shadow-xl transform transition-all duration-300 scale-95 hover:scale-100">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-indigo-600 transition-colors duration-200"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-3xl font-extrabold text-center mb-8 text-indigo-700">Choisir un événement</h3>
            <div className="w-full h-[450px] overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-gray-200 pr-2">
              {isLoadingEvents ? (
                <p className="p-8 text-center text-gray-600 text-lg animate-pulse">Chargement...</p>
              ) : eventError ? (
                <p className="p-8 text-center text-red-600 text-lg font-medium">{eventError}</p>
              ) : events.length === 0 ? (
                <p className="p-8 text-center text-gray-600 text-lg">Aucun événement disponible.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="bg-white border border-gray-200 p-5 rounded-lg cursor-pointer hover:shadow-lg hover:border-indigo-400 transition-all duration-300 transform hover:-translate-y-1"
                      onClick={() => selectEvent(event)}
                    >
                      <p className="font-bold text-xl text-gray-800">{event.nom}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Date: {new Date(event.date).toLocaleDateString("fr-FR")}
                      </p>
                      {event.description && (
                        <p className="text-sm text-gray-400 mt-2 line-clamp-2">{event.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Alerte duplication */}
      {showAlert && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-yellow-600 mb-4">Avertissement</h3>
            <p className="mb-4 text-gray-700">Le numéro de table est déjà utilisé dans cet événement.</p>
            <button
              onClick={() => setShowAlert(false)}
              className="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition-all duration-200"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Alerte succès */}
      {successMessage && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-green-600 mb-4">Succès</h3>
            <p className="mb-4 text-gray-700">{successMessage}</p>
            <button
              onClick={() => setSuccessMessage(null)}
              className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-all duration-200"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}