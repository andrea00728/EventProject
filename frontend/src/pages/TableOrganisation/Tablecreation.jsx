import { useState, useEffect } from "react";
import { getMyEvents } from "../../services/evenementServ";
import { useStateContext } from "../../context/ContextProvider";

export default function Tablecreation({ onSubmitTable }) {
  const { token } = useStateContext();

  // Formulaire
  const [form, setForm] = useState({
    capacite: "",
    type: "ronde",
    nombre: "",
    noms: [], // tableau pour stocker chaque nom
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
        const data = await getMyEvents(token);
        setEvents(data);
      } catch (err) {
        setEventError(
          err.response?.data?.message || "Impossible de charger les événements"
        );
      } finally {
        setIsLoadingEvents(false);
      }
    };

    if (token) fetchEvents();
  }, [token]);

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
    setForm({ ...form, [e.target.name]: e.target.value });
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
      // Remplir les noms vides avec un nom par défaut
      const nomsFinal = form.noms.map((nom, index) =>
        nom && nom.trim() !== "" ? nom : `Table ${index + 1}`
      );

      const formDataArray = nomsFinal.map((nom) => ({
        nom,
        capacite: form.capacite,
        type: form.type,
        eventId: form.eventId
      }));

      await onSubmitTable(formDataArray);

      // Réinitialiser le formulaire
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
    <div className="relative">
      <form
        onSubmit={onSubmit}
        className="p-8 bg-gray-50 max-w-md mx-auto shadow-lg rounded-xl mb-10 border border-gray-100"
      >
        <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">Créer une Table</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Capacité */}
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
              className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3"
            />
          </div>

          {/* Nombre */}
          <div className="flex flex-col">
            <label htmlFor="nombre" className="text-gray-700 font-medium mb-2 text-sm">
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
              className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3"
            />
          </div>

          {/* Type */}
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
              className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3"
            >
              <option value="ronde">Ronde</option>
              <option value="carree">Carrée</option>
              <option value="rectangle">Rectangle</option>
              <option value="ovale">Ovale</option>
            </select>
          </div>

          {/* Événement */}
          <div className="flex flex-col">
            <label className="text-gray-700 font-medium mb-2 text-sm">Événement Associé</label>
            <div
              className="flex items-center border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 cursor-pointer"
              onClick={() => setIsModalOpen(true)}
            >
              <input
                type="text"
                value={selectedEvent ? `${selectedEvent.nom} (${new Date(selectedEvent.date).toLocaleDateString("fr-FR")})` : "Sélectionner un événement"}
                readOnly
                className="flex-grow bg-transparent outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Inputs pour chaque nom */}
        {form.noms.length > 0 && (
          <div className="mt-6 space-y-4">
            {form.noms.map((nom, index) => (
              <div key={index} className="flex flex-col">
                <label className="text-gray-700 font-medium mb-2 text-sm">
                  Nom Table {index + 1}
                </label>
                <input
                  value={nom}
                  onChange={(e) => handleNomChange(index, e.target.value)}
                  placeholder={`Table ${index + 1}`}
                  className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3"
                />
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

        <div className="mt-8">
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold py-3 rounded-lg"
          >
            Ajouter Table
          </button>
        </div>
      </form>

      {/* Modal événements */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-3xl p-8 max-w-4xl mx-auto relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500"
            >
              ×
            </button>
            <h3 className="text-2xl font-bold text-center mb-6">Sélectionner un événement</h3>
            <div className="w-full h-[400px] overflow-y-auto">
              {isLoadingEvents ? (
                <p className="p-6 text-center">Chargement...</p>
              ) : eventError ? (
                <p className="p-6 text-center text-red-500">{eventError}</p>
              ) : events.length === 0 ? (
                <p className="p-6 text-center">Aucun événement disponible.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="bg-gray-800 text-white p-6 rounded-xl cursor-pointer"
                      onClick={() => selectEvent(event)}
                    >
                      <p className="font-semibold">{event.nom}</p>
                      <p className="text-sm">
                        Date: {new Date(event.date).toLocaleDateString("fr-FR")}
                      </p>
                      {event.description && (
                        <p className="text-xs mt-2">{event.description}</p>
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
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold text-yellow-700 mb-4">Avertissement</h3>
            <p className="mb-4">Le numéro de table est déjà utilisé dans cet événement.</p>
            <button
              onClick={() => setShowAlert(false)}
              className="w-full bg-yellow-500 text-white py-2 rounded-lg"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Alerte succès */}
      {successMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold text-green-700 mb-4">Succès</h3>
            <p className="mb-4">{successMessage}</p>
            <button
              onClick={() => setSuccessMessage(null)}
              className="w-full bg-green-500 text-white py-2 rounded-lg"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
