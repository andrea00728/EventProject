import React, { useState, useEffect, useRef } from "react";
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

import { getAllEvents } from '../services/evenementServ';
import { FaCalendarAlt, FaClock } from "react-icons/fa";

const SuccessEvent = () => {

    const [allEvents, setAllEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAllEvents = async () => {
        try {
            setLoading(true);
            setError(null);
    
            const events = await getAllEvents();
    
            if (!Array.isArray(events)) {
            throw new Error('La réponse du serveur n\'est pas un tableau');
            }
    
            // Trier par date décroissante et limiter à 4 événements les plus récents
            const sortedEvents = events
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 4);
            setAllEvents(sortedEvents);
    
        } catch (err) {
            console.error('❌ Erreur détaillée:', err);
    
            // Gestion d'erreur plus précise
            let errorMessage = 'Erreur lors du chargement des événements';
    
            if (err.response) {
            // Le serveur a répondu avec un code d'erreur
            errorMessage = `Erreur serveur: ${err.response.status} - ${err.response.data?.message || err.response.statusText}`;
            } else if (err.request) {
            // La requête a été faite mais pas de réponse
            errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
            } else if (err.message) {
            // Erreur dans la configuration de la requête
            errorMessage = `Erreur de configuration: ${err.message}`;
            }
    
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
        };
    
        fetchAllEvents();
    }, []);

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

    // Fonction pour formater la date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
        });
    };

    // Fonction pour formater l'heure
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


    return(
        <>
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
                    <>
                        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-5">
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

                        {/* Version mobile (slick slider) : visible en dessous de 'md' */}
                        <div className="md:hidden">
                            <Slider {...sliderSettings}>
                                {allEvents.map((event) => (
                                    <div key={event.id} className="p-2">
                                        <div className="group bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/60 hover:border-blue-300/60 transition-all duration-300 hover:shadow-xl hover:shadow-blue-100/30 hover:-translate-y-1">
                                            {/* Le contenu de la carte d'événement */}
                                            {/* Copiez/collez ici tout le contenu de la carte (y compris l'image, les badges, etc.) */}
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
                                    </div>
                                ))}
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
        </>
    )
}

export default SuccessEvent;