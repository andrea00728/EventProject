import React, { useState, useEffect } from "react";
// Assurez-vous d'importer createInvite, qui maintenant s'attend à l'eventId dans l'objet inviteData
import { createInviteForSpecificEvent  } from "../../services/inviteService"; 
import { getMyEvents } from "../../services/evenementServ";
import { useStateContext } from "../../context/ContextProvider";

// Composant Modal simple 
const EventSelectionModal = ({ events, onSelectEvent, onClose }) => {
 return (
    <div className="fixed inset-0 bg-[#000000] opacity-80 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-11/12 md:w-1/2 lg:w-2/3 xl:w-1/2 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl font-bold cursor-pointer"
          aria-label="Fermer"
        >
          &times; 
        </button>

        <h3 className="text-2xl font-bold mb-6 text-[#1C1B2E] text-center">
          Sélectionner un événement
        </h3>

       
        <div className="max-h-80 overflow-y-auto pr-2"> 
          {events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"> 
              {events.map((event) => (
                <div
                  key={event.id}
                  className="bg-[#000000] p-4 rounded-lg shadow-sm hover:shadow-md hover:bg-[#000000] cursor-pointer transition transform hover:-translate-y-1 flex flex-col justify-between border border-gray-200"
                  onClick={() => onSelectEvent(event)}
                >
                  <p className="font-semibold text-lg text-[#ffffff] mb-1">
                    {event.nom}
                  </p>
                  <p className="text-sm text-[#ffffff]">
                    Date: {new Date(event.date).toLocaleDateString()}
                  </p>
                  {event.description && ( 
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                        {event.description}
                      </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="p-4 text-center text-gray-500 bg-gray-50 rounded-md">
              Aucun événement disponible.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default function InviteformWithId({ onBack }) {
  const { token } = useStateContext();
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    sex: "",
    eventId: null, // Le champ eventId est déjà là, c'est parfait !
  });
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEventName, setSelectedEventName] = useState("");

  useEffect(() => {
    if (!token) return;
    getMyEvents(token)
      .then((data) => setEvents(data))
      .catch((err) =>
        console.error("Erreur chargement événements pour le formulaire:", err)
      );
  }, [token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setValidationErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleSelectEvent = (event) => {
    setForm((prevForm) => ({ ...prevForm, eventId: event.id }));
    setSelectedEventName(
      `${event.nom} (${new Date(event.date).toLocaleDateString()})`
    );
    setIsModalOpen(false);
    setValidationErrors((prev) => ({ ...prev, eventId: undefined }));
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const newValidationErrors = {};
    if (!form.nom.trim()) {
      newValidationErrors.nom = "Le nom est requis.";
    }
    if (!form.prenom.trim()) {
      newValidationErrors.prenom = "Le prénom est requis.";
    }
    if (!form.email.trim()) {
      newValidationErrors.email = "L'email est requis.";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newValidationErrors.email = "Format d'email invalide.";
    }
    if (!form.sex) {
      newValidationErrors.sex = "Le sexe est requis.";
    }
    if (!form.eventId) {
      newValidationErrors.eventId = "Veuillez sélectionner un événement.";
    }

    if (Object.keys(newValidationErrors).length > 0) {
      setValidationErrors(newValidationErrors);
      setError("Veuillez corriger les erreurs dans le formulaire.");
      return;
    }

    setError(null);
    setValidationErrors({});

    try {
      const invite = await createInviteForSpecificEvent (form, token); 
      
      console.log("Invité créé avec succès:", invite);
      setForm({ nom: "", prenom: "", email: "", sex: "", eventId: null });
      setSelectedEventName("");
    } catch (err) {
      console.error("Erreur back-end:", err.response?.data || err.message);
      setError(
        err.response?.data?.message ||
          "Erreur lors de la création de l'invité. Veuillez réessayer."
      );
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="p-8 mt-12 bg-white w-full mx-auto shadow-md rounded-lg mb-8"
    >
      <h2 className="text-2xl font-bold text-center mb-6 text-[#1C1B2E]">
        Ajouter un invité
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col">
          <label htmlFor="nom" className="text-gray-700 font-medium mb-2">
            Nom
          </label>
          <input
            id="nom"
            name="nom"
            type="text"
            value={form.nom}
            onChange={handleChange}
            placeholder="Nom de l'invité"
            required
            className={`border ${
              validationErrors.nom ? "border-red-500" : "border-gray-300"
            } bg-[#f5f5f5] rounded-md px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
          />
          {validationErrors.nom && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.nom}</p>
          )}
        </div>

        <div className="flex flex-col">
          <label htmlFor="prenom" className="text-gray-700 font-medium mb-2">
            Prénom
          </label>
          <input
            id="prenom"
            name="prenom"
            type="text"
            value={form.prenom}
            onChange={handleChange}
            placeholder="Prénom de l'invité"
            required
            className={`border ${
              validationErrors.prenom ? "border-red-500" : "border-gray-300"
            } bg-[#f5f5f5] rounded-md px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
          />
          {validationErrors.prenom && (
            <p className="text-red-500 text-sm mt-1">
              {validationErrors.prenom}
            </p>
          )}
        </div>

        <div className="flex flex-col">
          <label htmlFor="email" className="text-gray-700 font-medium mb-2">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email de l'invité"
            required
            className={`border ${
              validationErrors.email ? "border-red-500" : "border-gray-300"
            } bg-[#f5f5f5] rounded-md px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
          />
          {validationErrors.email && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
          )}
        </div>

        <div className="flex flex-col">
          <label htmlFor="sex" className="text-gray-700 font-medium mb-2">
            Sexe
          </label>
          <select
            id="sex"
            name="sex"
            value={form.sex}
            onChange={handleChange}
            required
            className={`border ${
              validationErrors.sex ? "border-red-500" : "border-gray-300"
            } bg-[#f5f5f5] rounded-md px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
          >
            <option value="">-- Sélectionnez --</option>
            <option value="M">Masculin</option>
            <option value="F">Féminin</option>
          </select>
          {validationErrors.sex && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.sex}</p>
          )}
        </div>

        {/* Champ pour la sélection d'événement */}
        <div className="flex flex-col md:col-span-2">
          <label htmlFor="event" className="text-gray-700 font-medium mb-2">
            Événement Associé
          </label>
          <div
            className={`flex items-center border ${
              validationErrors.eventId ? "border-red-500" : "border-gray-300"
            } bg-[#f5f5f5] rounded-md px-4 py-2 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:outline-none cursor-pointer`}
            onClick={handleOpenModal}
          >
            <input
              type="text"
              id="event"
              name="event"
              value={selectedEventName}
              readOnly
              placeholder="Cliquez pour sélectionner un événement"
              className="flex-grow bg-transparent outline-none cursor-pointer"
            />
            <button type="button" className="ml-2 text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          {validationErrors.eventId && (
            <p className="text-red-500 text-sm mt-1">
              {validationErrors.eventId}
            </p>
          )}
        </div>
      </div>

      {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

      <div className="flex justify-between mt-8">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 rounded bg-gray-300 text-gray-800 hover:bg-gray-400 transition"
          >
            Retour
          </button>
        )}
        <button
          type="submit"
          className="px-6 py-2 rounded bg-[#1C1B2E] text-white font-semibold hover:bg-[#2e2d44] transition"
        >
          Enregistrer l'invité
        </button>
      </div>

      {isModalOpen && (
        <EventSelectionModal
          events={events}
          onSelectEvent={handleSelectEvent}
          onClose={handleCloseModal}
        />
      )}
    </form>
  );
}