// frontend/SuccessEvent.tsx
import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { getAllEvents } from "../services/evenementServ";
import { FaCalendarAlt, FaClock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import defaultImage from "../../public/images/bouquet.jpg";
import { url } from "../api/url";

const SuccessEvent = () => {
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleRedirect = () => {
    navigate("/evenements-publics");
  };

  useEffect(() => {
    const fetchAllEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        const events = await getAllEvents();

        if (!Array.isArray(events)) {
          throw new Error("La réponse du serveur n'est pas un tableau");
        }

        // Filter out canceled events and sort by date descending
        const sortedEvents = events
          .filter((event) => event.status !== "canceled")
          .sort((a, b) => new Date(b.date) - new Date(a.date));
        setAllEvents(sortedEvents);
      } catch (err) {
        console.error("❌ Erreur détaillée:", err);
        let errorMessage = "Erreur lors du chargement des événements";

        if (err.response) {
          errorMessage = `Erreur serveur: ${err.response.status} - ${err.response.data?.message || err.response.statusText}`;
        } else if (err.request) {
          errorMessage = "Impossible de contacter le serveur. Vérifiez votre connexion.";
        } else if (err.message) {
          errorMessage = `Erreur de configuration: ${err.message}`;
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchAllEvents();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusTextAndColor = (status) => {
    switch (status) {
      case "planned":
        return { status: "en attente", color: "bg-yellow-500", text: "En attente" };
      case "completed":
        return { status: "terminé", color: "bg-green-500", text: "Terminé" };
      case "canceled":
        return { status: "annuler", color: "bg-red-500", text: "Annulé" };
      default:
        return { status: "inconnu", color: "bg-gray-500", text: "Inconnu" };
    }
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <div className="container mx-auto max-w-6xl px-6">
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-blue-200/50 rounded-full px-5 py-2.5 text-sm font-semibold text-blue-700 shadow-sm mb-6">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          Événements Réalisés
        </div>
        <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-4">
          Nos Derniers Succès
        </h2>
        <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
          Découvrez les événements récents organisés avec excellence
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-md mx-auto">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        </div>
      ) : allEvents.length > 0 ? (
        <>
          <div className="hidden md:flex flex-wrap justify-center gap-8 w-full">
            {allEvents.slice(0, 4).map((event) => {
              const { status, color, text } = getStatusTextAndColor(event.status);
              return (
                <div key={event.id} className="group perspective-1000 flex-1 min-w-0 max-w-[280px]">
                  <div className="relative transform-gpu transition-all duration-700 ease-in-out hover:rotate-y-3 hover:-translate-y-2 hover:scale-[1.02] shadow-xl hover:shadow-2xl hover:shadow-purple-200/50 rounded-2xl overflow-hidden bg-white/70 border border-white/80">
                    <div className="relative h-48 overflow-hidden">
                      {event.imageUrl ? (
                        <img
                          src={`${url}${event.imageUrl}`}
                          alt={event.nom}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ease-in-out"
                          onError={(e) => {
                            e.target.src = defaultImage;
                          }}
                        />
                      ) : (
                        <img
                          src={defaultImage}
                          alt="Image par défaut"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ease-in-out"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent">
                        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                          <span className="bg-white/90 backdrop-blur-sm text-slate-800 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ring-1 ring-white/30">
                            {event.type || "Événement"}
                          </span>
                          <span
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ring-1 ${
                              event.isPublic
                                ? "bg-green-100/90 text-green-700 border border-green-200/50"
                                : "bg-blue-100/90 text-blue-700 border border-blue-200/50"
                            }`}
                          >
                            {event.isPublic ? "Public" : "Privé"}
                          </span>
                        </div>
                        <div className="absolute bottom-4 right-4">
                          <div
                            className={`bg-gradient-to-r ${color} text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md`}
                          >
                            {status === "terminé" && (
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                            {text}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 space-y-5">
                      <div>
                        <h3 className="text-xl font-extrabold text-slate-900 mb-2 group-hover:bg-gradient-to-r group-hover:from-purple-500 group-hover:to-fuchsia-600 group-hover:bg-clip-text group-hover:text-transparent transition-colors line-clamp-2">
                          {event.nom}
                        </h3>
                        {event.theme && (
                          <p className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full inline-block">
                            {event.theme}
                          </p>
                        )}
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-slate-600">
                          <FaCalendarAlt className="w-4 h-4 text-purple-500" />
                          <span className="text-sm font-medium">{formatDate(event.date)}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600">
                          <FaClock className="w-4 h-4 text-fuchsia-500" />
                          <span className="text-sm">
                            {formatTime(event.date)} - {formatTime(event.date_fin)}
                          </span>
                        </div>
                        {event.salle && (
                          <div className="text-sm text-slate-700 bg-gradient-to-r from-slate-50 to-purple-50/50 px-4 py-3 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                              <span className="font-semibold">{event.salle.nom}</span>
                            </div>
                            <span className="text-slate-500 text-xs ml-4">
                              Capacité : {event.salle.capacite} personnes
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                            <div className={`w-2 h-2 ${color} rounded-full`}></div>
                            {text}
                          </div>
                          <div className="text-xs text-slate-400 font-mono">#{event.id}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {allEvents.length > 4 && (
            <div className="text-center mt-12">
              <button
                onClick={handleRedirect}
                className="inline-flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors px-6 py-3 text-sm font-semibold text-white shadow-lg"
                aria-label="Voir plus d'événements"
              >
                Voir plus d'événements
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5 ml-2"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 010-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          )}

          <div className="md:hidden">
            <Slider {...sliderSettings}>
              {allEvents.map((event) => {
                const { status, color, text } = getStatusTextAndColor(event.status);
                return (
                  <div key={event.id} className="p-2">
                    <div className="group relative shadow-lg rounded-2xl overflow-hidden bg-white/70 border border-white/80">
                      <div className="relative h-48 overflow-hidden">
                        {event.imageUrl ? (
                          <img
                            src={`${url}${event.imageUrl}`}
                            alt={event.nom}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = defaultImage;
                            }}
                          />
                        ) : (
                          <img
                            src={defaultImage}
                            alt="Image par défaut"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ease-in-out"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent">
                          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                            <span className="bg-white/90 backdrop-blur-sm text-slate-800 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ring-1 ring-white/30">
                              {event.type || "Événement"}
                            </span>
                            <span
                              className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ring-1 ${
                                event.isPublic
                                  ? "bg-green-100/90 text-green-700 border border-green-200/50"
                                  : "bg-blue-100/90 text-blue-700 border border-blue-200/50"
                              }`}
                            >
                              {event.isPublic ? "Public" : "Privé"}
                            </span>
                          </div>
                          <div className="absolute bottom-4 right-4">
                            <div
                              className={`bg-gradient-to-r ${color} text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md`}
                            >
                              {status === "terminé" && (
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                              {text}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-6 space-y-5">
                        <div>
                          <h3 className="text-xl font-extrabold text-slate-900 mb-2 line-clamp-2">{event.nom}</h3>
                          {event.theme && (
                            <p className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full inline-block">{event.theme}</p>
                          )}
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-slate-600">
                            <FaCalendarAlt className="w-4 h-4 text-purple-500" />
                            <span className="text-sm font-medium">{formatDate(event.date)}</span>
                          </div>
                          <div className="flex items-center gap-3 text-slate-600">
                            <FaClock className="w-4 h-4 text-fuchsia-500" />
                            <span className="text-sm">{formatTime(event.date)} - {formatTime(event.date_fin)}</span>
                          </div>
                          {event.salle && (
                            <div className="text-sm text-slate-700 bg-gradient-to-r from-slate-50 to-purple-50/50 px-4 py-3 rounded-xl border border-slate-100">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                                <span className="font-semibold">{event.salle.nom}</span>
                              </div>
                              <span className="text-slate-500 text-xs ml-4">Capacité : {event.salle.capacite} personnes</span>
                            </div>
                          )}
                        </div>
                        <div className="pt-4 border-t border-slate-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                              <div className={`w-2 h-2 ${color} rounded-full`}></div>
                              {text}
                            </div>
                            <div className="text-xs text-slate-400 font-mono">#{event.id}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </Slider>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="bg-white/60 border border-slate-200/50 rounded-2xl p-8 max-w-md mx-auto backdrop-blur-sm">
            <FaCalendarAlt className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">Aucun événement disponible</h3>
            <p className="text-slate-500 text-sm">Les événements organisés apparaîtront ici prochainement.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuccessEvent;