import React, { useEffect, useState } from "react";
import GestionPlan from "../../components/planTable/GestionPlan";
import { getMyEvents } from "../../services/evenementServ";
import { useStateContext } from "../../context/ContextProvider";

export default function Apercu() {
  const { isAuthenticated } = useStateContext();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [eventError, setEventError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!isAuthenticated) {
        setEventError("Veuillez vous connecter pour voir vos événements.");
        setIsLoadingEvents(false);
        return;
      }
      setIsLoadingEvents(true);
      try {
        const data = await getMyEvents();
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
  }, [isAuthenticated]);

  return (
    <div className="p-4 w-full overflow-x-hidden">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">Graphique</h1>

      <div className="relative mb-6">
        {/* Background decorative elements */}
        <div className="absolute -top-4 right-0 w-16 h-16 bg-gradient-to-bl from-indigo-100/30 to-transparent rounded-full blur-xl"></div>
        <div className="absolute -bottom-2 left-0 w-16 h-16 bg-gradient-to-tr from-purple-100/20 to-transparent rounded-full blur-xl"></div>

        <div className="relative z-10 w-full">
          {/* Enhanced Header */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-1 h-8 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></div>
                <div className="absolute inset-0 w-1 h-8 bg-gradient-to-b from-indigo-400 to-purple-500 rounded-full animate-pulse opacity-60"></div>
              </div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Sélectionner un événement
              </h2>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent"></div>
          </div>

          {/* Loading State */}
          {isLoadingEvents && (
            <div className="flex items-center space-x-3 py-4 px-6 bg-gradient-to-r from-indigo-50/50 to-purple-50/30 rounded-xl border border-indigo-100/50">
              <div className="relative">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-200"></div>
                <div className="absolute inset-0 animate-spin rounded-full h-6 w-6 border-2 border-transparent border-t-indigo-500"></div>
              </div>
              <p className="text-gray-700 font-medium">Chargement des événements...</p>
              <div className="ml-auto flex space-x-1">
                <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-pink-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          )}

          {/* Error State */}
          {eventError && (
            <div className="relative bg-gradient-to-r from-red-50 to-rose-50/70 border border-red-200/60 rounded-xl p-5 shadow-sm overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-400 to-red-600"></div>
              <div className="absolute top-0 right-0 w-12 h-12 bg-red-100/40 rounded-full blur-xl"></div>

              <div className="relative flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-red-700 font-medium">{eventError}</p>
                </div>
              </div>
            </div>
          )}

          {/* No Events State */}
          {!isLoadingEvents && !eventError && events.length === 0 && (
            <div className="relative bg-gradient-to-r from-amber-50 to-yellow-50/60 border border-amber-200/60 rounded-xl p-6 shadow-sm overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-yellow-500"></div>
              <div className="absolute top-0 right-0 w-12 h-12 bg-amber-100/30 rounded-full blur-xl"></div>

              <div className="relative flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-amber-800 mb-1">Aucun événement disponible</h4>
                  <p className="text-amber-700 text-sm">Aucun événement trouvé. Créez un événement d'abord pour continuer.</p>
                </div>
              </div>
            </div>
          )}

          {/* Events Tabs */}
          {!isLoadingEvents && !eventError && events.length > 0 && (
            <div className="relative w-full">
              {/* Custom Tabs Container */}
              <div className="relative bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-50/50 to-transparent"></div>

                {/* Tabs Navigation */}
                <div className="relative flex flex-wrap border-b border-gray-100">
                  {events.map((event) => {
                    const isSelected = selectedEvent?.id === event.id;
                    return (
                      <button
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className={`group relative flex-shrink-0 px-4 py-3 font-medium text-sm transition-all duration-300 min-w-[100px] ${
                          isSelected
                            ? 'text-indigo-600 bg-white'
                            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50/80'
                        }`}
                      >
                        {/* Tab Content */}
                        <div className="relative flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            isSelected
                              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 shadow-sm'
                              : 'bg-gray-300 group-hover:bg-indigo-400'
                          }`}></div>
                          <span className="whitespace-nowrap truncate">{event.nom}</span>
                        </div>

                        {/* Active Tab Indicator */}
                        {isSelected && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                        )}

                        {/* Hover Effect Background */}
                        <div className={`absolute inset-0 transition-all duration-300 ${
                          isSelected
                            ? 'bg-gradient-to-b from-indigo-50/50 to-transparent'
                            : 'bg-gradient-to-b from-gray-50/0 to-gray-50/50 opacity-0 group-hover:opacity-100'
                        }`}></div>
                      </button>
                    );
                  })}
                </div>

                {/* Selection Info Bar */}
                {selectedEvent && (
                  <div className="relative px-4 py-2 bg-gradient-to-r from-indigo-50/50 to-purple-50/30 border-t border-indigo-100/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-gray-700 truncate">
                          Événement sélectionné : <span className="text-indigo-600 font-semibold">{selectedEvent.nom}</span>
                        </span>
                      </div>

                      {selectedEvent.date && (
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{new Date(selectedEvent.date).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <style >{`
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>

      {selectedEvent && (
        <div className="w-full overflow-x-hidden">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 truncate">
            Plan de salle pour : {selectedEvent.nom}
          </h2>
          <div className="w-full overflow-x-hidden">
            <GestionPlan selectedEventId={selectedEvent.id} />
          </div>
        </div>
      )}
    </div>
  );
}