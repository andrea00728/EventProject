import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosClient from '../api/axios-client';
import { createInviteForSpecificEvent } from '../services/inviteService';
import { textControll } from '../services/controll_champs/controll_champs';

// const EventSelectionModal = ({ events, onSelectEvent, onClose }) => {
//   return (
//     <div className="fixed inset-0 bg-black/30 backdrop:blur-lg flex justify-center items-center z-50 transition-opacity duration-300 ease-in-out">
//       <div className="bg-white rounded-3xl mt-[80px] shadow-2xl p-8 max-w-4xl mx-auto transform transition-all duration-300 ease-out scale-100 animate-fadeIn">
//         <button
//           onClick={onClose}
//           className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 rounded-full p-2 transition-colors duration-200 cursor-pointer"
//           aria-label="Fermer la modale"
//         >
//           ×
//         </button>

//         <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center font-sans">
//           Sélectionner un événement
//         </h3>

//         <div className="w-[100%] h-[400px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
//           {events.length > 0 ? (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//               {events.map((event) => (
//                 <div
//                   key={event.id}
//                   className="bg-gradient-to-br from-gray-800 to-gray-900 text-white p-6 rounded-xl shadow-lg hover:shadow-xl hover:from-gray-700 hover:to-gray-800 cursor-pointer transition-all duration-300 transform hover:-translate-y-1"
//                   onClick={() => onSelectEvent(event)}
//                   role="button"
//                   tabIndex={0}
//                   onKeyDown={(e) => e.key === "Enter" && onSelectEvent(event)}
//                   aria-label={`Sélectionner ${event.nom}`}
//                 >
//                   <p className="font-semibold text-lg mb-2">{event.nom}</p>
//                   <p className="text-sm text-gray-200">
//                     Date: {new Date(event.date).toLocaleDateString("fr-FR")}
//                   </p>
//                   {event.description && (
//                     <p className="text-xs text-gray-300 mt-2 line-clamp-2">
//                       {event.description}
//                     </p>
//                   )}
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <p className="p-6 text-center text-gray-500 bg-gray-50 rounded-xl">
//               Aucun événement disponible.
//             </p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

const PublicEvents = () => {
  // États pour la gestion des événements
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // États pour les modals
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Ajouté
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // États pour le formulaire d'inscription
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    sex: "",
    eventId: null,
  });
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const [selectedEventName, setSelectedEventName] = useState(""); // Ajouté
  const [validationErrors, setValidationErrors] = useState({}); // Ajouté
  const [isSubmitting, setIsSubmitting] = useState(false); // Ajouté

  // États pour la pagination
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 5;

  // Chargement initial des événements
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const response = await axiosClient.get("/evenements");
        setEvents(response.data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les événements. Veuillez réessayer plus tard.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Filtrage des événements selon le filtre sélectionné
  const filteredEvents = events.filter(ev => {
    if (filter === "public") return ev.isPublic === true;
    if (filter === "private") return ev.isPublic === false;
    return true;
  });

  // Calcul de la pagination
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
  const currentEvents = filteredEvents.slice(
    (currentPage - 1) * eventsPerPage,
    currentPage * eventsPerPage
  );

  // Fonction pour ouvrir le modal de détails d'un événement
  const openEventModal = (event) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  // Fonction pour fermer le modal de détails
  const closeEventModal = () => {
    setIsEventModalOpen(false);
    setSelectedEvent(null);
  };

  // Fonction pour ouvrir le modal d'inscription directement
  const openRegistrationModal = (event = null) => {
    if (event) {
      setSelectedEvent(event);
      setForm({ nom: "", prenom: "", email: "", sex: "", eventId: event.id });
      setSelectedEventName(`${event.nom} (${new Date(event.date).toLocaleDateString("fr-FR")})`);
    } else {
      setForm({ nom: "", prenom: "", email: "", sex: "", eventId: null });
      setSelectedEventName("");
    }
    setIsRegistrationModalOpen(true);
    setIsEventModalOpen(false);
    setValidationErrors({});
    setError(null);
  };

  // Fonction pour fermer le modal d'inscription
  const closeRegistrationModal = () => {
    setIsRegistrationModalOpen(false);
    setForm({ nom: "", prenom: "", email: "", sex: "", eventId: null });
    setSelectedEventName("");
    setValidationErrors({});
    setError(null);
  };

  const closeSuccessModal = () => {
    setIsSuccessModalOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === "nom" || name === "prenom" ? textControll(value) : value
    }));
    setValidationErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleSelectEvent = (event) => {
    setForm(prev => ({ ...prev, eventId: event.id }));
    setSelectedEventName(`${event.nom} (${new Date(event.date).toLocaleDateString("fr-FR")})`);
    setIsModalOpen(false);
    setValidationErrors(prev => ({ ...prev, eventId: undefined }));
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Soumission du formulaire d'inscription
  const handleSubmit = async (e) => {
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
      const invite = await createInviteForSpecificEvent(form);
      console.log("Invité créé avec succès:", invite);
      setForm({ nom: "", prenom: "", email: "", sex: "", eventId: null });
      setSelectedEventName("");
      setIsRegistrationModalOpen(false);
      setIsSuccessModalOpen(true);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="container mx-auto px-6 py-12">
        {/* En-tête de la page */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full mb-6">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent mb-4">
            Événements
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Découvrez tous les événements disponibles
          </p>
        </div>

        {/* Filtre de sélection des événements */}
        <div className="flex justify-center mb-8">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-slate-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Tous les événements</option>
            <option value="public">Événements publics</option>
            <option value="private">Événements privés</option>
          </select>
        </div>

        {/* Indicateur de chargement */}
        {isLoading && (
          <div className="flex flex-col items-center py-24">
            <div className="w-16 h-16 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-500"></div>
            <p className="mt-4 text-slate-600 font-medium">
              Chargement des événements...
            </p>
          </div>
        )}

        {/* Message d'erreur */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6">
              <div className="flex items-center">
                <svg
                  className="w-6 h-6 text-red-500 mr-3"
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
                <div>
                  <h3 className="text-red-800 font-semibold">
                    Erreur de chargement
                  </h3>
                  <p className="text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Affichage des événements */}
        {!isLoading && !error && (
          <>
            {filteredEvents.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full mb-6">
                  <svg
                    className="w-10 h-10 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-600 mb-2">
                  Aucun événement
                </h3>
                <p className="text-slate-500">
                  Revenez plus tard pour découvrir de nouveaux événements.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {currentEvents.map((event) => (
                    <div
                      key={event.id}
                      className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 overflow-hidden transform hover:-translate-y-1"
                    >
                      {/* Barre colorée en haut de la carte */}
                      <div
                        className={`h-2 bg-gradient-to-r ${event.id % 3 === 0
                            ? "from-indigo-500 to-cyan-500"
                            : event.id % 3 === 1
                              ? "from-pink-500 to-rose-500"
                              : "from-emerald-500 to-lime-500"
                          }`}
                      ></div>

                      <div className="p-6">
                        {/* Titre de l'événement */}
                        <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wide mb-4">
                          {event.nom}
                        </h2>

                        {/* Détails de l'événement */}
                        <div className="space-y-2 mb-6">
                          <p>
                            <span className="text-slate-500 font-medium">
                              Type :
                            </span>{" "}
                            {event.type}
                          </p>
                          <p>
                            <span className="text-slate-500 font-medium">
                              Thème :
                            </span>{" "}
                            {event.theme}
                          </p>
                          <p>
                            <span className="text-slate-500 font-medium">
                              Date :
                            </span>{" "}
                            {new Date(event.date).toLocaleDateString("fr-FR", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          <p>
                            <span className="text-slate-500 font-medium">
                              Lieu :
                            </span>{" "}
                            {event.location?.nom.split(",").slice(0, 2).join(", ") || "Non précisé"}

                          </p>
                        </div>

                        {/* Boutons d'action conditionnels */}
                        <div className="flex gap-3 justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEventModal(event);
                            }}
                            className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors duration-200"
                          >
                            Détails
                          </button>
                          {event.isPublic && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openRegistrationModal(event);
                              }}
                              className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all duration-200 transform hover:scale-105 ${event.id % 5 === 0
                                  ? "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                                  : event.id % 5 === 1
                                    ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                                    : event.id % 5 === 2
                                      ? "bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600"
                                      : event.id % 5 === 3
                                        ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                                        : "bg-gradient-to-r from-amber-500 to-blue-500 hover:from-amber-600 hover:to-blue-600"
                                }`}
                            >
                              S'inscrire
                            </button>
                          )}
                        </div>

                        {/* Boutons d'action conditionnels */}
                        {/* <div className="flex gap-3 justify-end"> */}
                          {/* Bouton Détails - toujours présent */}
                          {/* <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEventModal(event);
                            }}
                            className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors duration-200"
                          >
                            Détails
                          </button> */}

                          {/* Bouton S'inscrire - seulement pour les événements publics */}
                          {/* {event.isPublic && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openRegistrationModal(event);
                              }}
                              className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all duration-200 transform hover:scale-105 ${event.id % 5 === 0 ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600' :
                                event.id % 5 === 1 ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' :
                                  event.id % 5 === 2 ? 'bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600' :
                                    event.id % 5 === 3 ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600' :
                                      'bg-gradient-to-r from-amber-500 to-blue-500 hover:from-amber-600 hover:to-blue-600'
                                }`}
                            >
                              S'inscrire
                            </button>
                          )}
                        </div> */}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Pagination */}
                {filteredEvents.length > 0 && (
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 mx-1 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50"
                    >
                      Précédent
                    </button>
                    <span className="px-4 py-2 mx-1 text-gray-700">
                      Page {currentPage} sur {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 mx-1 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50"
                    >
                      Suivant
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Modal de détails d'événement */}
        {isEventModalOpen && selectedEvent && (
          <AnimatePresence>
            <div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={closeEventModal}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  {/* En-tête du modal avec titre et bouton fermer */}
                  <div className="flex items-start justify-between mb-6">
                    <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-wide leading-tight">
                      {selectedEvent.nom}
                    </h2>
                    <button
                      onClick={closeEventModal}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Description de l'événement */}
                  {selectedEvent.description && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-slate-700 mb-2">
                        Description
                      </h3>
                      <p className="text-slate-600">{selectedEvent.description}</p>
                    </div>
                  )}

                  {/* Détails structurés de l'événement */}
                  <div className="space-y-4">
                    {/* Type */}
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                          Type
                        </p>
                        <p className="text-slate-800 font-semibold">
                          {selectedEvent.type}
                        </p>
                      </div>
                    </div>

                    {/* Thème */}
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-purple-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-4.244-4.243A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                          Thème
                        </p>
                        <p className="text-slate-800 font-semibold">
                          {selectedEvent.theme}
                        </p>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-pink-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                          Date
                        </p>
                        <p className="text-slate-800 font-semibold">
                          {new Date(selectedEvent.date).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Lieu */}
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-orange-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                          Lieu
                        </p>
                        <p className="text-slate-800 font-semibold">
                          {selectedEvent.location?.nom || "Non précisé"}
                        </p>
                      </div>
                    </div>

                    {/* Salle (si présente) */}
                    {selectedEvent.salle?.nom && (
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-amber-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                            Salle
                          </p>
                          <p className="text-slate-800 font-semibold">
                            {selectedEvent.salle.nom}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Boutons d'action du modal */}
                  <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100">
                    {selectedEvent.isPublic && (
                      <button
                        onClick={openRegistrationModal}
                        className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 shadow-lg ${selectedEvent.id % 5 === 0
                            ? "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                            : selectedEvent.id % 5 === 1
                              ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                              : selectedEvent.id % 5 === 2
                                ? "bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600"
                                : selectedEvent.id % 5 === 3
                                  ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                                  : "bg-gradient-to-r from-amber-500 to-blue-500 hover:from-amber-600 hover:to-blue-600"
                          }`}
                        aria-label={`S'inscrire à l'événement ${selectedEvent.nom}`}
                      >
                        S'inscrire
                      </button>
                    )}
                    <button
                      onClick={closeEventModal}
                      className="px-6 py-3 rounded-xl font-medium text-slate-600 hover:text-slate-800 transition-colors duration-200"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </AnimatePresence>
        )}

        {/* Registration Modal */}
        {isRegistrationModalOpen && (
          <AnimatePresence>
            <div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={closeRegistrationModal}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-2xl w-1/2 mx-4 overflow-hidden max-h-[90vh] overflow-y-auto p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col lg:flex-row">
                  {/* Section image - cachée sur mobile */}
                  {/* <div className="hidden lg:block lg:w-1/2 bg-gray-100">
                    <img
                      src="/images/IMG1.jpg"
                      alt="Événement"
                      className="w-full h-full object-cover max-h-[65vh]"
                    />
                  </div> */}

                  {/* Section formulaire */}
                  <div className="w-full p-4 sm:p-6">
                    {/* En-tête du formulaire */}
                    <div className="flex items-start justify-between mb-6">
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-800 uppercase tracking-wide leading-tight">
                        Inscription à {selectedEventName || "l'événement"}
                      </h2>
                      <button
                        onClick={closeRegistrationModal}
                        className="text-slate-400 hover:text-slate-600 ml-4"
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Formulaire d'inscription */}
                    <form onSubmit={handleSubmit}>
                      <div className="space-y-4 mb-6">
                        {/* Champ Nom */}
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-semibold text-gray-700 mb-1">
                            Nom <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="nom"
                            value={form.nom}
                            onChange={handleChange}
                            required
                            placeholder="Votre nom"
                            className={`border ${validationErrors.nom
                                ? "border-red-500"
                                : "border-gray-300"
                              } rounded-lg sm:rounded-xl px-4 py-2 sm:px-5 sm:py-3 focus:ring-2 focus:ring-indigo-200 transition`}
                            aria-invalid={validationErrors.nom ? "true" : "false"}
                          />
                          {validationErrors.nom && (
                            <p className="text-red-500 text-sm mt-1 flex items-center">
                              <svg
                                className="h-4 w-4 mr-1"
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
                              {validationErrors.nom}
                            </p>
                          )}
                        </div>

                        {/* Champ Prénom */}
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-semibold text-gray-700 mb-1">
                            Prénom <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="prenom"
                            value={form.prenom}
                            onChange={handleChange}
                            required
                            placeholder="Votre prénom"
                            className={`border ${validationErrors.prenom
                                ? "border-red-500"
                                : "border-gray-300"
                              } rounded-lg sm:rounded-xl px-4 py-2 sm:px-5 sm:py-3 focus:ring-2 focus:ring-indigo-200 transition`}
                            aria-invalid={validationErrors.prenom ? "true" : "false"}
                          />
                          {validationErrors.prenom && (
                            <p className="text-red-500 text-sm mt-1 flex items-center">
                              <svg
                                className="h-4 w-4 mr-1"
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
                              {validationErrors.prenom}
                            </p>
                          )}
                        </div>

                        {/* Champ Email */}
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-semibold text-gray-700 mb-1">
                            Email <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            placeholder="Votre email"
                            className={`border ${validationErrors.email
                                ? "border-red-500"
                                : "border-gray-300"
                              } rounded-lg sm:rounded-xl px-4 py-2 sm:px-5 sm:py-3 focus:ring-2 focus:ring-indigo-200 transition`}
                            aria-invalid={validationErrors.email ? "true" : "false"}
                          />
                          {validationErrors.email && (
                            <p className="text-red-500 text-sm mt-1 flex items-center">
                              <svg
                                className="h-4 w-4 mr-1"
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
                              {validationErrors.email}
                            </p>
                          )}
                        </div>

                        {/* Champ Sexe */}
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-semibold text-gray-700 mb-1">
                            Sexe <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="sex"
                            value={form.sex}
                            onChange={handleChange}
                            required
                            className={`border ${validationErrors.sex
                                ? "border-red-500"
                                : "border-gray-300"
                              } rounded-lg sm:rounded-xl px-4 py-2 sm:px-5 sm:py-3 focus:ring-2 focus:ring-indigo-200 transition`}
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

                        {/* Champ Événement Associé */}
                        <div
                          className={`flex items-center border border-gray-300 bg-gray-100 rounded-lg px-4 py-3 opacity-70 cursor-not-allowed`}
                          role="button"
                          tabIndex={-1}
                          aria-disabled="true"
                        >
                          <input
                            type="text"
                            name="event"
                            value={selectedEventName}
                            readOnly
                            disabled
                            placeholder="Sélection désactivée"
                            className="flex-grow bg-transparent outline-none cursor-not-allowed text-gray-500 placeholder-gray-400"
                          />
                        </div>

                      </div>

                      {error && (
                        <p className="text-red-500 mt-6 text-center bg-red-50 py-3 rounded-xl flex items-center justify-center transition-all duration-200">
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

                      <div className="relative flex flex-col sm:flex-row items-center gap-4 pt-6 my-6 border-t border-slate-100">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className={`absolute top-5 right-0 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg sm:rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 shadow-lg ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                            } ${selectedEvent?.id % 5 === 0
                              ? "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                              : selectedEvent?.id % 5 === 1
                                ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                                : selectedEvent?.id % 5 === 2
                                  ? "bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600"
                                  : selectedEvent?.id % 5 === 3
                                    ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                                    : "bg-gradient-to-r from-amber-500 to-blue-500 hover:from-amber-600 hover:to-blue-600"
                            }`}
                        >
                          {isSubmitting ? (
                            <>
                              <svg
                                className="animate-spin h-5 w-5 mr-2 text-white"
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
                            "Confirmer l'inscription"
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </motion.div>
            </div>
          </AnimatePresence>
        )}

        {/* Success Modal */}
        {isSuccessModalOpen && (
          <AnimatePresence>
            <div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={closeSuccessModal}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 mb-2">
                    Inscription réussie
                  </h2>
                  <p className="text-slate-600 mb-6">
                    Votre inscription à {selectedEventName || "l'événement"} a été
                    enregistrée avec succès.
                  </p>
                  <button
                    onClick={closeSuccessModal}
                    className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    Fermer
                  </button>
                </div>
              </motion.div>
            </div>
          </AnimatePresence>
        )}

        {/* Event Selection Modal */}
        {isModalOpen && (
          <EventSelectionModal
            events={events}
            onSelectEvent={handleSelectEvent}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </div>
  );
};

export default PublicEvents;