import React, { useState, useEffect } from 'react';
import { Users, Calendar, MapPin, Clock, FileText } from 'lucide-react';

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
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Image de l'événement */}
        {eventData.image && (
          <div className="h-48 bg-gray-200 flex items-center justify-center">
            <img 
              src={eventData.image} 
              alt="Événement" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}
        
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Informations de l'Événement
          </h2>
          
          {/* Grid avec les informations principales */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-center text-gray-600">
                <Users className="mr-3 h-5 w-5 text-blue-500" />
                <span className="font-medium">Organisateur:</span>
                <span className="ml-2 text-gray-800">{eventData.organizer}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <Calendar className="mr-3 h-5 w-5 text-green-500" />
                <span className="font-medium">Nom de l'événement:</span>
                <span className="ml-2 text-gray-800 font-semibold">{eventData.eventName}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <Calendar className="mr-3 h-5 w-5 text-purple-500" />
                <span className="font-medium">Date:</span>
                <span className="ml-2 text-gray-800">{eventData.date}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center text-gray-600">
                <Clock className="mr-3 h-5 w-5 text-orange-500" />
                <span className="font-medium">Heure:</span>
                <span className="ml-2 text-gray-800">{eventData.time}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <MapPin className="mr-3 h-5 w-5 text-red-500" />
                <span className="font-medium">Lieu:</span>
                <span className="ml-2 text-gray-800">{eventData.location}</span>
              </div>
            </div>
          </div>
          
          {/* Section des détails */}
          <div className="border-t pt-6">
            <div className="flex items-start text-gray-600">
              <FileText className="mr-3 h-5 w-5 mt-1 text-indigo-500" />
              <div className="flex-1">
                <span className="font-medium text-gray-800 block mb-3 text-lg">
                  Détails de l'événement:
                </span>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 leading-relaxed">
                    {eventData.details}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Informations supplémentaires */}
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">150</div>
              <div className="text-sm text-blue-800">Invités attendus</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">12</div>
              <div className="text-sm text-green-800">Membres du personnel</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">8</div>
              <div className="text-sm text-purple-800">Tables disponibles</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
