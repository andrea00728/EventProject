import { useState, useEffect, useRef } from 'react';
import Footer from "./footer";
import { FaAward, FaMapMarkerAlt, FaUsers, FaCalendarAlt, FaClock } from "react-icons/fa";
import TestimonialsSection from "../util/testimonialsSection";
import { getAllEvents } from '../services/evenementServ';
import tutorialVideo from "../assets/demo.mp4"; // import de la vidéo

export default function Accueil() {
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showVideo, setShowVideo] = useState(true);

  const videoRef = useRef(null);

  const toggleFullScreen = () => {
    if (videoRef.current) {
      if (!document.fullscreenElement) {
        videoRef.current.requestFullscreen().catch(err => console.log(err));
      } else {
        document.exitFullscreen();
      }
    }
  };

  const getEventIcon = (type) => {
    const icons = {
      'mariage': '💒',
      'anniversaire': '🎂',
      'conference': '🎤',
      'seminaire': '📚',
      'concert': '🎵',
      'exposition': '🖼️',
      'formation': '🎓',
      'reunion': '👥',
      'default': '🎉'
    };
    return icons[type?.toLowerCase()] || icons.default;
  };

  useEffect(() => {
    const fetchAllEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        const events = await getAllEvents();

        if (!Array.isArray(events)) {
          throw new Error('La réponse du serveur n\'est pas un tableau');
        }

        const sortedEvents = events
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 4);
        setAllEvents(sortedEvents);

      } catch (err) {
        console.error('❌ Erreur détaillée:', err);
        let errorMessage = 'Erreur lors du chargement des événements';

        if (err.response) {
          errorMessage = `Erreur serveur: ${err.response.status} - ${err.response.data?.message || err.response.statusText}`;
        } else if (err.request) {
          errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
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
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventTypeColor = (type) => {
    const colors = {
      'conférence': 'from-blue-500 to-indigo-600',
      'workshop': 'from-purple-500 to-violet-600',
      'formation': 'from-green-500 to-emerald-600',
      'séminaire': 'from-orange-500 to-red-600',
      'meetup': 'from-pink-500 to-rose-600',
      'webinaire': 'from-cyan-500 to-blue-600',
      default: 'from-gray-500 to-slate-600'
    };
    return colors[type?.toLowerCase()] || colors.default;
  };

  return (
    <>
      {/* Section Hero */}
      <section className="relative bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30 py-32 px-4 overflow-hidden">
        {/* décorations */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-[#FB9E3A]/15 to-orange-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-gradient-to-l from-indigo-300/20 to-purple-300/15 rounded-full blur-2xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-violet-200/10 to-fuchsia-200/10 rounded-full blur-3xl" />

        <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between gap-20 max-w-7xl relative z-10">
          {/* Contenu textuel */}
          <div className="flex-1 max-w-2xl text-center lg:text-left space-y-8">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-indigo-100 rounded-full px-4 py-2 text-sm font-medium text-indigo-700 shadow-sm">
              <div className="w-2 h-2 bg-[#FB9E3A] rounded-full animate-pulse"></div>
              Plateforme d'organisation événementielle
            </div>

            <h1 className="text-5xl lg:text-7xl font-black text-slate-800 leading-[1.1] tracking-tight">
              Organisez vos
              <span className="block text-7xl bg-clip-text bg-gradient-to-r from-[#FB9E3A] via-orange-500 to-amber-500 drop-shadow-sm">
                événements
              </span>
              <span className="text-4xl lg:text-5xl font-bold text-indigo-600">
                comme un pro
              </span>
            </h1>

            <p className="text-slate-600 text-xl lg:text-2xl leading-relaxed font-normal max-w-xl">
              Une plateforme complète et intuitive pour créer, gérer et promouvoir vos événements
              <span className="font-semibold text-slate-700"> sans effort</span>.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button className="group relative bg-gradient-to-r from-[#6B46C1] via-purple-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 active:scale-95">
                <span className="relative z-10">Commencer gratuitement</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-indigo-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>

              <button className="group bg-white/80 backdrop-blur-sm text-slate-700 border-2 border-slate-200 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white hover:border-slate-300 hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95">
                <span className="flex items-center gap-2">
                  Voir la démo
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-9V8a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h12a3 3 0 013 3z" />
                  </svg>
                </span>
              </button>
            </div>
          </div>

          {/* Image */}
          <div className="flex-1 flex justify-center lg:justify-end relative">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#FB9E3A]/20 to-indigo-400/20 rounded-full scale-110 blur-xl"></div>

              <div className="relative bg-white/30 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/40">
                <img
                  src="/src/assets/undraw_having-fun_kkeu.svg"
                  alt="Illustration organisateurs d'événements"
                  className="w-full max-w-lg h-auto drop-shadow-lg hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section principale */}
      <section className="relative w-full min-h-screen flex flex-col md:flex-row items-center justify-center gap-8 px-6 md:px-20 py-16 bg-gray-50">
        {/* Vidéo à gauche */}
        {showVideo && (
          <div className="relative w-full md:w-1/2 rounded-2xl overflow-hidden shadow-2xl">
            <video
              ref={videoRef}
              src={tutorialVideo}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-64 md:h-full object-cover rounded-2xl"
            />
            <button
              onClick={toggleFullScreen}
              className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-md text-sm font-semibold shadow hover:bg-white transition"
            >
              {document.fullscreenElement ? "Quitter plein écran" : "Plein écran"}
            </button>
          </div>
        )}

        {/* Description + Boutons à droite */}
        <div className="flex-1 flex flex-col gap-4">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900">
            Ceci est une démonstration directe
          </h2>
          <p className="text-gray-700 text-sm md:text-base">
            Explorez les fonctionnalités de notre plateforme comme vous le souhaitez.
            Vous pouvez regarder la vidéo en petit écran ou en plein écran selon vos préférences.
          </p>

          <div className="flex gap-4 mt-4">
            {/* Bouton pour ouvrir le modal */}
            <button
              onClick={() => setIsOpen(true)}
              className="bg-indigo-600 text-white px-5 py-3 rounded-xl font-semibold hover:scale-105 transition"
            >
              Voir la démo
            </button>

            {/* Bouton pour afficher/masquer la vidéo */}
            <button
              onClick={() => setShowVideo(!showVideo)}
              className="bg-gray-200 text-gray-900 px-5 py-3 rounded-xl font-semibold hover:scale-105 transition"
            >
              {showVideo ? "Masquer la vidéo" : "Voir la vidéo"}
            </button>

            {/* Bouton pour télécharger la vidéo */}
            <a
              href={tutorialVideo}
              download="demonstration.mp4"
              className="bg-green-600 text-white px-5 py-3 rounded-xl font-semibold hover:scale-105 transition flex items-center justify-center"
            >
              Télécharger la vidéo
            </a>
          </div>
        </div>
      </section>

      {/* Modal plein écran */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <div className="relative w-full h-full bg-white flex flex-col items-center justify-center">
            {/* Bouton fermer */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-6 text-2xl font-bold text-gray-800 hover:text-red-500 transition-colors"
            >
              ✕
            </button>

            {/* Contenu du modal */}
            <h1 className="text-3xl font-bold text-gray-900">
              Page de démonstration
            </h1>
          </div>
        </div>
      )}


      {/* Section Événements de Succès */}
      <section className="bg-gradient-to-br from-slate-50 via-white to-blue-50/20 py-20">
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
              Découvrez les 4 événements les plus récents organisés avec excellence
            </p>
          </div>

          {/* Contenu dynamique des événements */}
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
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {allEvents.map((event) => (
                <div key={event.id} className="group bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/60 hover:border-blue-300/60 transition-all duration-300 hover:shadow-xl hover:shadow-blue-100/30 hover:-translate-y-1">

                  {/* Image de l'événement */}
                  <div className="relative h-48 overflow-hidden">
                    {event.image ? (
                      <img
                        src={event.image}
                        alt={event.nom}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          // Si l'image ne charge pas, afficher l'image par défaut
                          e.target.src = '/default-event-image.jpg';
                        }}
                      />
                    ) : (
                      // Image par défaut avec gradient et icône
                      <div className={`w-full h-full bg-gradient-to-br ${getEventTypeColor(event.type)} relative flex items-center justify-center`}>
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="text-white/80 text-6xl">
                          {getEventIcon(event.type)}
                        </div>
                      </div>
                    )}

                    {/* Overlay avec badges */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent">
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className="bg-white/95 backdrop-blur-sm text-slate-700 px-3 py-1.5 rounded-full text-xs font-bold">
                          {event.type || 'Événement'}
                        </span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${event.isPublic
                          ? 'bg-green-100/90 text-green-700 border border-green-200/50'
                          : 'bg-blue-100/90 text-blue-700 border border-blue-200/50'
                          }`}>
                          {event.isPublic ? 'Public' : 'Privé'}
                        </span>
                      </div>

                      {/* Badge Succès */}
                      <div className="absolute bottom-3 right-3">
                        <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Réalisé
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contenu */}
                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {event.nom}
                      </h3>
                      {event.theme && (
                        <p className="text-slate-600 text-xs font-medium bg-slate-100 px-2.5 py-1 rounded-full inline-block">
                          {event.theme}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2.5 text-slate-600">
                        <FaCalendarAlt className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-sm font-medium">{formatDate(event.date)}</span>
                      </div>

                      <div className="flex items-center gap-2.5 text-slate-600">
                        <FaClock className="w-3.5 h-3.5 text-purple-500" />
                        <span className="text-sm">
                          {formatTime(event.date)} - {formatTime(event.date_fin)}
                        </span>
                      </div>

                      {event.salle && (
                        <div className="text-sm text-slate-600 bg-gradient-to-r from-slate-50 to-blue-50/50 px-3 py-2 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                            <span className="font-medium">{event.salle.nom}</span>
                          </div>
                          <span className="text-slate-500 text-xs ml-3.5">
                            Capacité: {event.salle.capacite} personnes
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Indicateur de statut en bas */}
                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                          Événement terminé
                        </div>
                        <div className="text-xs text-slate-400 font-medium">
                          #{event.id}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
      </section>

      {/* Section À Propos */}
      <section className="bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-800 py-24">
        {/* Décorations de fond light */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-[#FB9E3A]/10 to-orange-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-gradient-to-l from-indigo-400/15 to-purple-400/10 rounded-full blur-2xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-violet-300/5 to-fuchsia-300/5 rounded-full blur-3xl" />

        <div className="container mx-auto max-w-7xl relative z-10 px-6">
          <div className="mb-20">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full px-4 py-2 text-sm font-medium text-slate-600 shadow-sm mb-4">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                À propos
              </div>

              <h3 className="text-3xl lg:text-4xl font-black text-slate-800 mb-4">
                Qui sommes-nous ?
              </h3>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Notre Mission */}
              <div className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 hover:border-orange-300 transition-all duration-300 hover:shadow-lg hover:shadow-orange-100 hover:bg-white/90">
                <div className="w-12 h-12 bg-gradient-to-br from-[#FB9E3A] to-orange-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>

                <h4 className="text-xl font-bold text-slate-800 mb-3">Notre Mission</h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Simplifier l'organisation d'événements et créer des expériences mémorables pour tous nos utilisateurs.
                </p>
              </div>

              {/* Notre Équipe */}
              <div className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 hover:border-indigo-300 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-100 hover:bg-white/90">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                  <FaUsers className="w-6 h-6 text-white" />
                </div>

                <h4 className="text-xl font-bold text-slate-800 mb-3">Notre Équipe</h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Une équipe passionnée de développeurs et designers dédiés à l'innovation événementielle.
                </p>
              </div>

              {/* Nos Valeurs */}
              <div className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 hover:border-emerald-300 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-100 hover:bg-white/90">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                  <FaAward className="w-6 h-6 text-white" />
                </div>

                <h4 className="text-xl font-bold text-slate-800 mb-3">Nos Valeurs</h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Excellence, innovation et satisfaction client sont au cœur de tout ce que nous faisons.
                </p>
              </div>

              {/* Notre Localisation */}
              <div className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 hover:border-pink-300 transition-all duration-300 hover:shadow-lg hover:shadow-pink-100 hover:bg-white/90">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                  <FaMapMarkerAlt className="w-6 h-6 text-white" />
                </div>

                <h4 className="text-xl font-bold text-slate-800 mb-3">Basés à Paris</h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Situés au cœur de Paris, nous servons des clients dans le monde entier depuis 2020.
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center group">
                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FB9E3A] to-orange-500 mb-2 group-hover:scale-110 transition-transform">
                  500+
                </div>
                <p className="text-slate-500 text-sm font-semibold">Événements organisés</p>
              </div>

              <div className="text-center group">
                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 mb-2 group-hover:scale-110 transition-transform">
                  50K+
                </div>
                <p className="text-slate-500 text-sm font-semibold">Participants heureux</p>
              </div>

              <div className="text-center group">
                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-500 mb-2 group-hover:scale-110 transition-transform">
                  98%
                </div>
                <p className="text-slate-500 text-sm font-semibold">Satisfaction client</p>
              </div>

              <div className="text-center group">
                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500 mb-2 group-hover:scale-110 transition-transform">
                  24/7
                </div>
                <p className="text-slate-500 text-sm font-semibold">Support disponible</p>
              </div>
            </div>
          </div>
        </div>
      </section>


      <section className="testimony">
        <TestimonialsSection />
      </section>

      <section>
        <Footer />
      </section>
    </>
  );
}
