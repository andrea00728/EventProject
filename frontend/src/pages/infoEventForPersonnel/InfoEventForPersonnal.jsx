import React, { useState, useEffect } from 'react';
import { Users, Calendar, MapPin, Clock, FileText, Star, Trophy, Target } from 'lucide-react';

export const InfoEventForPersonnal = () => {
  const [eventData, setEventData] = useState({
    organizer: "Marie Dubois",
    eventName: "Conférence Tech 2024", 
    date: "15 Décembre 2024",
    time: "14:00 - 18:00",
    location: "Centre de Conférences Paris",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=200&fit=crop",
    details: "Une conférence sur les dernières innovations technologiques avec des speakers internationaux. Nous aborderons l'IA, le développement durable et les nouvelles tendances du marché."
  });

  // Simulation d'un appel API pour récupérer les données de l'événement
  useEffect(() => {
    // Ici vous pourrez faire votre appel API
    // fetchEventData();
  }, []);

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header avec titre principal */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Informations de l'Événement</h1>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden backdrop-blur-sm border border-white/20">
          {/* Image de l'événement avec overlay */}
          {eventData.image && (
            <div className="relative h-64 bg-gradient-to-r from-blue-600 to-purple-600">
              <img 
                src={eventData.image} 
                alt="Événement" 
                className="w-full h-full object-cover opacity-90"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <h2 className="text-3xl font-bold mb-2">{eventData.eventName}</h2>
                <div className="flex items-center space-x-4 text-white/90">
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {eventData.date}
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    {eventData.time}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div className="p-8">
            {/* Grid avec les informations principales */}
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              <div className="space-y-6">
                <div className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border border-blue-200 hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-blue-800 uppercase tracking-wide">Organisateur</span>
                    <p className="text-lg font-semibold text-gray-900">{eventData.organizer}</p>
                  </div>
                </div>
                
                <div className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl border border-purple-200 hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-purple-800 uppercase tracking-wide">Date</span>
                    <p className="text-lg font-semibold text-gray-900">{eventData.date}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl border border-orange-200 hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mr-4">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-orange-800 uppercase tracking-wide">Horaire</span>
                    <p className="text-lg font-semibold text-gray-900">{eventData.time}</p>
                  </div>
                </div>
                
                <div className="flex items-center p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-2xl border border-red-200 hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center mr-4">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-red-800 uppercase tracking-wide">Lieu</span>
                    <p className="text-lg font-semibold text-gray-900">{eventData.location}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Section des détails avec design amélioré */}
            <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 rounded-2xl p-6 border border-indigo-200 mb-8">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Détails de l'événement
                  </h3>
                  <div className="bg-white/70 backdrop-blur p-6 rounded-xl border border-white/50">
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {eventData.details}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistiques avec design moderne */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform">
                <div className="flex items-center justify-between mb-4">
                  <Star className="h-8 w-8 text-blue-200" />
                  <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse"></div>
                </div>
                <div className="text-3xl font-bold mb-1">150</div>
                <div className="text-blue-100 text-sm font-medium uppercase tracking-wide">Invités attendus</div>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform">
                <div className="flex items-center justify-between mb-4">
                  <Trophy className="h-8 w-8 text-emerald-200" />
                  <div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse"></div>
                </div>
                <div className="text-3xl font-bold mb-1">12</div>
                <div className="text-emerald-100 text-sm font-medium uppercase tracking-wide">Membres du personnel</div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform">
                <div className="flex items-center justify-between mb-4">
                  <Target className="h-8 w-8 text-purple-200" />
                  <div className="w-2 h-2 bg-purple-300 rounded-full animate-pulse"></div>
                </div>
                <div className="text-3xl font-bold mb-1">8</div>
                <div className="text-purple-100 text-sm font-medium uppercase tracking-wide">Tables disponibles</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};