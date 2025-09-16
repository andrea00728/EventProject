import React, { useState, useEffect, useCallback } from "react";
import { getMyEvents, updateEvent, cancelEvent, restoreEvent, getHiddenEvents } from "../../services/evenementServ";
import { useStateContext } from "../../context/ContextProvider";
import Modal from "../../components/Modal/EventModal";
import DeleteEventButton from "../../util/DeleteEvenement";

const EventAccept = () => {
  const { isAuthenticated } = useStateContext();
  const [events, setEvents] = useState([]);
  const [hiddenEvents, setHiddenEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [showHiddenEvents, setShowHiddenEvents] = useState(false);
  const [error, setError] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [eventToCancel, setEventToCancel] = useState(null);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [eventToRestore, setEventToRestore] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

  const showNotification = useCallback((message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setError("Authentification requise pour voir les événements.");
      setIsLoading(false);
      return;
    }

    fetchEvents();
  }, [isAuthenticated]);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const data = await getMyEvents();
      console.log("Événements récupérés:", data);
      // Filtrer les événements pour exclure ceux avec status 'canceled'
      const filteredEvents = data.filter((event) => event.status !== "canceled");
      setEvents(filteredEvents);
      setError(null);
    } catch (error) {
      console.error("Erreur lors de la récupération des événements:", error);
      setError("Erreur lors du chargement des événements.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHiddenEvents = async () => {
    try {
      const data = await getHiddenEvents();
      setHiddenEvents(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des événements masqués:", error);
      showNotification("Erreur lors de la récupération des événements masqués", "error");
    }
  };

  const openModal = (event, mode = "view") => {
    console.log("Ouverture de la modale pour l'événement:", event);
    setSelectedEvent({ ...event, mode });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleUpdateEvent = async (updatedEvent) => {
    if (!updatedEvent || !updatedEvent.id) {
      showNotification("L'événement mis à jour ou son identifiant est manquant.", "error");
      return;
    }
    try {
      console.log("Mise à jour de l'événement:", updatedEvent);
      const formData = new FormData();
      Object.keys(updatedEvent).forEach((key) => {
        if (key === "image" && updatedEvent[key] instanceof File) {
          formData.append(key, updatedEvent[key]);
        } else if (key !== "image" && updatedEvent[key] != null) {
          formData.append(key, updatedEvent[key]);
        }
      });
      const response = await updateEvent({
        eventId: updatedEvent.id,
        eventData: formData,
      });
      console.log("Événement mis à jour:", response);
      setEvents(events.map((e) => (e.id === updatedEvent.id ? response : e)));
      setIsModalOpen(false);
      setSelectedEvent(null);
      showNotification("Événement mis à jour avec succès", "success");
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'événement:", error);
      showNotification(error.message || "Erreur lors de la mise à jour de l'événement", "error");
    }
  };

  const handleCancelEvent = useCallback((eventId) => {
    setEventToCancel(eventId);
    setIsCancelModalOpen(true);
  }, []);

  const confirmCancel = useCallback(async () => {
    if (!eventToCancel) return;

    try {
      await cancelEvent(eventToCancel);
      // Retirer l'événement annulé de la liste principale
      setEvents(events.filter((event) => event.id !== eventToCancel));
      // Rafraîchir la liste des événements annulés si elle est affichée
      if (showHiddenEvents) {
        await fetchHiddenEvents();
      }
      showNotification("Événement annulé avec succès", "success");
    } catch (error) {
      console.error("Erreur lors de l'annulation de l'événement:", error);
      showNotification("Erreur lors de l'annulation de l'événement", "error");
    } finally {
      setIsCancelModalOpen(false);
      setEventToCancel(null);
    }
  }, [eventToCancel, events, showHiddenEvents, showNotification]);

  const closeModalConfirm = () => {
    setIsCancelModalOpen(false);
    setEventToCancel(null);
  };

  const handleRestoreEvent = useCallback((eventId) => {
    setEventToRestore(eventId);
    setIsRestoreModalOpen(true);
  }, []);

  const confirmRestore = useCallback(async () => {
    if (!eventToRestore) return;

    setIsRestoring(true);
    try {
      await restoreEvent(eventToRestore);
      // Retirer l'événement restauré de la liste des événements annulés
      setHiddenEvents(hiddenEvents.filter((event) => event.id !== eventToRestore));
      // Rafraîchir la liste principale pour inclure l'événement restauré
      await fetchEvents();
      showNotification("Événement restauré avec succès", "success");
    } catch (error) {
      console.error("Erreur lors de la restauration de l'événement:", error);
      showNotification("Erreur lors de la restauration de l'événement", "error");
    } finally {
      setIsRestoring(false);
      setIsRestoreModalOpen(false);
      setEventToRestore(null);
    }
  }, [eventToRestore, hiddenEvents, showNotification, fetchEvents]);

  const closeRestoreModal = () => {
    setIsRestoreModalOpen(false);
    setEventToRestore(null);
  };

  const toggleHiddenEvents = async () => {
    if (!showHiddenEvents) {
      await fetchHiddenEvents();
    }
    setShowHiddenEvents(!showHiddenEvents);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    const normalizedPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    return `${API_BASE_URL}${normalizedPath}`;
  };

  const getStatusTextAndColor = (status) => {
    switch (status) {
      case "planned":
        return { text: "En attente", color: "bg-yellow-500", textColor: "text-yellow-600" };
      case "canceled":
        return { text: "Annulé", color: "bg-red-500", textColor: "text-red-600" };
      case "completed":
        return { text: "Terminé", color: "bg-green-500", textColor: "text-green-600" };
      default:
        return { text: "Inconnu", color: "bg-gray-500", textColor: "text-gray-600" };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Mes Événements
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Gérez et consultez tous vos événements créés en un seul endroit
          </p>

          <button
            onClick={toggleHiddenEvents}
            className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:ring-2 focus:ring-gray-400 focus:outline-none transition-colors"
            aria-label={showHiddenEvents ? "Masquer les événements annulés" : "Voir les événements annulés"}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>{showHiddenEvents ? "Masquer les événements annulés" : "Voir les événements annulés"}</span>
          </button>
        </div>

        {notification.show && (
          <div
            className={`fixed top-4 right-4 max-w-sm w-full p-4 rounded-lg shadow-lg text-white ${notification.type === "success" ? "bg-green-600" : "bg-red-600"
              }`}
            role="alert"
            aria-live="assertive"
          >
            <p>{notification.message}</p>
          </div>
        )}

        {showHiddenEvents && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-700 mb-4">Événements Annulés</h2>
            {hiddenEvents.length === 0 ? (
              <p className="text-gray-500">Aucun événement annulé.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {hiddenEvents.map((event) => {
                  const imageUrl = getImageUrl(event.imageUrl);
                  const { text, color, textColor } = getStatusTextAndColor(event.status);
                  return (
                    <div key={event.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                      <div className="mb-4 relative w-full h-32 rounded-lg overflow-hidden border border-slate-200">
                        {event.imageUrl ? (
                          <img
                            src={imageUrl || "https://placehold.co/300x150?text=Aucune+image"}
                            alt={`Image de l'événement ${event.nom}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = "https://placehold.co/300x150?text=Image+non+disponible";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{event.nom}</h3>
                      <p className="text-gray-600 mb-1">
                        <span className="font-medium">Type:</span> {event.type}
                      </p>
                      <p className="text-gray-600 mb-1">
                        <span className="font-medium">Thème:</span> {event.theme}
                      </p>
                      <p className="text-gray-600 mb-1">
                        <span className="font-medium">Date:</span>{" "}
                        {new Date(event.date).toLocaleDateString("fr-FR")}
                      </p>
                      <p className={`mb-3 font-medium ${textColor}`}>
                        <span className="font-medium">Statut:</span> {text}
                      </p>
                      <button
                        onClick={() => handleRestoreEvent(event.id)}
                        className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:outline-none transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
                        aria-label={`Restaurer l'événement ${event.nom}`}
                        disabled={isRestoring}
                      >
                        {isRestoring && eventToRestore === event.id ? "Restauration..." : "Restaurer"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col justify-center items-center h-96">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-200 rounded-full animate-spin border-t-purple-500"></div>
              <div
                className="absolute inset-0 w-16 h-16 border-4 border-pink-200 rounded-full animate-spin border-t-pink-500 animate-reverse"
                style={{ animationDelay: "0.15s" }}
              ></div>
            </div>
            <p className="mt-4 text-slate-600 font-medium">Chargement de vos événements...</p>
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6" role="alert" aria-live="assertive">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-red-800 font-semibold">Erreur de chargement</h3>
                  <p className="text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!isLoading && !error && !showHiddenEvents && (
          <>
            {events.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full mb-6">
                  <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-600 mb-2">Aucun événement trouvé</h3>
                <p className="text-slate-500">Vous n'avez pas encore créé d'événements.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 items-stretch">
                {events.map((event, index) => {
                  const imageUrl = getImageUrl(event.imageUrl);
                  const { text, color, textColor } = getStatusTextAndColor(event.status);
                  return (
                    <div
                      key={event.id}
                      className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 overflow-hidden transform hover:-translate-y-1 h-full flex flex-col"
                    >
                      <div
                        className={`h-2 bg-gradient-to-r ${index % 5 === 0
                            ? "from-blue-500 to-purple-500"
                            : index % 5 === 1
                              ? "from-purple-500 to-pink-500"
                              : index % 5 === 2
                                ? "from-pink-500 to-orange-500"
                                : index % 5 === 3
                                  ? "from-orange-500 to-amber-500"
                                  : "from-amber-500 to-blue-500"
                          }`}
                      ></div>
                      <div className="p-6 relative flex flex-col flex-grow">
                        <div className="mb-6 relative w-full h-48 rounded-lg overflow-hidden border border-slate-200 shadow-sm group-hover:shadow-md transition-shadow duration-300">
                          {event.imageUrl ? (
                            <img
                              src={imageUrl || "https://placehold.co/300x150?text=Aucune+image"}
                              alt={`Image de l'événement ${event.nom}`}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              loading="lazy"
                              onError={(e) => {
                                console.error(`Erreur de chargement de l'image pour l'événement ${event.nom}:`, imageUrl);
                                e.target.src = "https://placehold.co/300x150?text=Image+non+disponible";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-400">
                              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="1.5"
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              <p className="mt-2 text-sm font-medium">Aucune image disponible</p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-start justify-between mb-6">
                          <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wide leading-tight">{event.nom}</h2>
                          <div className={`w-3 h-3 rounded-full ${color}`}></div>
                        </div>
                        <div className="space-y-4 flex-grow">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Type</p>
                              <p className="text-slate-800 font-semibold">{event.type}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Thème</p>
                              <p className="text-slate-800 font-semibold">{event.theme}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Date</p>
                              <p className="text-slate-800 font-semibold">
                                {new Date(event.date).toLocaleDateString("fr-FR", {
                                  day: "2-digit",
                                  month: "long",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Lieu</p>
                              <p className="text-slate-800 font-semibold">{event.location?.nom.split(",").slice(0, 2).join(", ") || "Non précisé"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Salle</p>
                              <p className="text-slate-800 font-semibold">{event.salle?.nom || "Non précisé"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className={`flex-shrink-0 w-8 h-8 ${color} rounded-lg flex items-center justify-center`}>
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Statut</p>
                              <p className={`font-semibold ${textColor}`}>{text}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center justify-start gap-3 pt-6 mt-6 border-t border-slate-200">
                          <button
                            onClick={() => openModal(event, "view")}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors text-sm font-medium"
                            aria-label={`Voir les détails de l'événement ${event.nom}`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Détails
                          </button>
                          {event.status !== "canceled" && (
                            <>
                              <button
                                onClick={() => openModal(event, "edit")}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:outline-none transition-colors text-sm font-medium"
                                aria-label={`Modifier l'événement ${event.nom}`}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                                Modifier
                              </button>
                              <button
                                onClick={() => handleCancelEvent(event.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none transition-colors text-sm font-medium"
                                aria-label={`Annuler l'événement ${event.nom}`}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Annuler
                              </button>
                            </>
                          )}
                          <DeleteEventButton
                            eventId={event.id}
                            onDeleted={(deletedId) => setEvents(events.filter((e) => e.id !== deletedId))}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-colors text-sm font-medium"
                            showLabel={true}
                            label="Supprimer"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {selectedEvent && (
          <Modal
            isOpen={isModalOpen}
            onClose={closeModal}
            event={selectedEvent}
            onSave={selectedEvent?.mode === "edit" ? handleUpdateEvent : undefined}
          />
        )}

        {isCancelModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="cancel-modal-title">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
              <h2 id="cancel-modal-title" className="text-lg font-semibold text-gray-800 mb-4">
                Confirmer l'annulation
              </h2>
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir annuler cet événement ? Il sera marqué comme annulé mais pas supprimé.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={closeModalConfirm}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmCancel}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        )}

        {isRestoreModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="restore-modal-title">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
              <h2 id="restore-modal-title" className="text-lg font-semibold text-gray-800 mb-4">
                Confirmer la restauration
              </h2>
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir restaurer cet événement ? Il sera à nouveau visible dans la liste des événements actifs.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={closeRestoreModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition focus:outline-none focus:ring-2 focus:ring-gray-400"
                  disabled={isRestoring}
                >
                  Annuler
                </button>
                <button
                  onClick={confirmRestore}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-green-400 disabled:cursor-not-allowed"
                  disabled={isRestoring}
                >
                  {isRestoring ? "Restauration..." : "Confirmer"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventAccept;