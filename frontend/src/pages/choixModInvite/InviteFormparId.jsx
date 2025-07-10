import React, { useState, useEffect } from "react";
import { createInviteForSpecificEvent } from "../../services/inviteService";
import { getMyEvents } from "../../services/evenementServ";
import { useStateContext } from "../../context/ContextProvider";

const EventSelectionModal = ({ events, onSelectEvent, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black  bg-opacity-30 flex justify-center items-center z-50 transition-opacity duration-300 ease-in-out">
      <div className="bg-white rounded-3xl mt-[80px] shadow-2xl p-8  max-w-4xl mx-auto transform transition-all duration-300 ease-out scale-100 animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 rounded-full p-2 transition-colors duration-200 cursor-pointer"
          aria-label="Fermer la modale"
        >
          ×
        </button>

        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center font-sans">
          Sélectionner un événement
        </h3>

        <div className="w-[100%] h-[400px]  overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {events.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="bg-gradient-to-br from-gray-800 to-gray-900 text-white p-6 rounded-xl shadow-lg hover:shadow-xl hover:from-gray-700 hover:to-gray-800 cursor-pointer transition-all duration-300 transform hover:-translate-y-1"
                  onClick={() => onSelectEvent(event)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && onSelectEvent(event)}
                  aria-label={`Sélectionner ${event.nom}`}
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
          ) : (
            <p className="p-6 text-center text-gray-500 bg-gray-50 rounded-xl">
              Aucun événement disponible.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default function InviteFormWithId({ onBack }) {
  const { token } = useStateContext();
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    sex: "",
    eventId: null,
  });
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEventName, setSelectedEventName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      `${event.nom} (${new Date(event.date).toLocaleDateString("fr-FR")})`
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
    setIsSubmitting(true);

    try {
      const invite = await createInviteForSpecificEvent(form, token);
      console.log("Invité créé avec succès:", invite);
      setForm({ nom: "", prenom: "", email: "", sex: "", eventId: null });
      setSelectedEventName("");
    } catch (err) {
      console.error("Erreur back-end:", err.response?.data || err.message);
      setError(
        err.response?.data?.message ||
          "Erreur lors de la création de l'invité. Veuillez réessayer."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
    
    >
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">
        Ajouter un invité
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col">
          <label
            htmlFor="nom"
            className="text-gray-700 font-medium mb-2 text-sm"
          >
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
              validationErrors.nom ? "border-red-500" : "border-gray-200"
            } bg-gray-50 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none transition-all duration-200 placeholder-gray-400`}
            aria-invalid={validationErrors.nom ? "true" : "false"}
          />
          {validationErrors.nom && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <svg
                className="h-4 w-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {validationErrors.nom}
            </p>
          )}
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="prenom"
            className="text-gray-700 font-medium mb-2 text-sm"
          >
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
              validationErrors.prenom ? "border-red-500" : "border-gray-200"
            } bg-gray-50 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none transition-all duration-200 placeholder-gray-400`}
            aria-invalid={validationErrors.prenom ? "true" : "false"}
          />
          {validationErrors.prenom && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <svg
                className="h-4 w-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {validationErrors.prenom}
            </p>
          )}
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="email"
            className="text-gray-700 font-medium mb-2 text-sm"
          >
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
              validationErrors.email ? "border-red-500" : "border-gray-200"
            } bg-gray-50 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none transition-all duration-200 placeholder-gray-400`}
            aria-invalid={validationErrors.email ? "true" : "false"}
          />
          {validationErrors.email && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <svg
                className="h-4 w-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {validationErrors.email}
            </p>
          )}
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="sex"
            className="text-gray-700 font-medium mb-2 text-sm"
          >
            Sexe
          </label>
          <select
            id="sex"
            name="sex"
            value={form.sex}
            onChange={handleChange}
            required
            className={`border ${
              validationErrors.sex ? "border-red-500" : "border-gray-200"
            } bg-gray-50 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none transition-all duration-200`}
            aria-invalid={validationErrors.sex ? "true" : "false"}
          >
            <option value="">-- Sélectionnez --</option>
            <option value="M">Masculin</option>
            <option value="F">Féminin</option>
          </select>
          {validationErrors.sex && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <svg
                className="h-4 w-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {validationErrors.sex}
            </p>
          )}
        </div>

        <div className="flex flex-col md:col-span-2">
          <label
            htmlFor="event"
            className="text-gray-700 font-medium mb-2 text-sm"
          >
            Événement Associé
          </label>
          <div
            className={`flex items-center border ${
              validationErrors.eventId ? "border-red-500" : "border-gray-200"
            } bg-gray-50 rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-indigo-600 cursor-pointer transition-all duration-200`}
            onClick={handleOpenModal}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && handleOpenModal()}
            aria-label="Sélectionner un événement"
          >
            <input
              type="text"
              id="event"
              name="event"
              value={selectedEventName}
              readOnly
              placeholder="Cliquez pour sélectionner un événement"
              className="flex-grow bg-transparent outline-none cursor-pointer text-gray-900 placeholder-gray-400"
            />
            <button
              type="button"
              className="ml-2 text-gray-500 hover:text-indigo-600 focus:outline-none transition-colors duration-200"
              aria-label="Ouvrir la sélection d'événements"
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
          {validationErrors.eventId && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <svg
                className="h-4 w-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {validationErrors.eventId}
            </p>
          )}
        </div>
      </div>

      {error && (
        <p className="text-red-500 mt-6 text-center bg-red-50 py-3 rounded-xl flex items-center justify-center transition-all duration-200">
          <svg
            className="h-5 w-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
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

      <div className="flex justify-between mt-8">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 rounded-lg bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-2 focus:ring-gray-400 transition-all duration-200 font-medium"
            aria-label="Retour"
          >
            Retour
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold hover:from-indigo-700 hover:to-indigo-800 focus:ring-2 focus:ring-indigo-600 transition-all duration-200 flex items-center justify-center ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
          aria-label="Enregistrer l'invité"
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Enregistrement...
            </>
          ) : (
            "Enregistrer l'invité"
          )}
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