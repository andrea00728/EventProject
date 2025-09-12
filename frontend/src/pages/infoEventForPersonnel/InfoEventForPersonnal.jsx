import React, { useState, useEffect } from "react";
import { useStateContext } from "../../context/ContextProvider";
import { Users, Calendar, MapPin, Clock, FileText, Star, Trophy, Target } from "lucide-react";
import { url } from "../../api/url";
import defaultImage from "../../assets/images/bouquet.jpg";
import { BookOpen } from "lucide-react"; // Icône pour le thème (ou une autre qui te plaît)
import { Tag } from "lucide-react"; // Icône pour la catégorie (ou une autre qui te plaît)

export const InfoEventForPersonnal = () => {
  const { user } = useStateContext();
  const personnelEmail = user?.email;

  const [eventData, setEventData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEventData = async () => {
      if (!personnelEmail) return;

      setIsLoading(true);
      try {
        const res = await fetch(
          `http://localhost:3000/personnel/events-by-email?email=${encodeURIComponent(personnelEmail)}`
        );

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || "Erreur inconnue");
        }

        const data = await res.json();
        setEventData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventData();
  }, [personnelEmail]);

  if (!personnelEmail) return <p className="p-8 text-gray-500">Email manquant</p>;
  if (isLoading) return <p className="p-8">Chargement...</p>;
  if (error) return <p className="p-8 text-red-600">{error}</p>;
  if (!eventData) return <p className="p-8 text-gray-500">Aucune donnée disponible</p>;

  const organizer = eventData.organizer || "N/A";

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 sm:mb-6 drop-shadow-lg leading-snug text-center">
          <span className="block bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-slideDown">
            🎉 Informations de l'Événement
          </span>
        </h1>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden backdrop-blur-sm border border-white/20">
        {/* Image en background */}
        <div
          className="relative h-48 sm:h-64 md:h-80 bg-cover bg-center"
          style={{
            backgroundImage: `url(${eventData.image ? url + eventData.image : defaultImage})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 text-white">
            <h2 className="text-xl sm:text-3xl font-bold mb-1 sm:mb-2">{eventData.eventName}</h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-sm sm:text-base text-white/90">
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                {new Date(eventData.date).toLocaleDateString()}
              </span>
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                {new Date(eventData.date).toLocaleTimeString()} -{" "}
                {eventData.date_fin ? new Date(eventData.date_fin).toLocaleTimeString() : "N/A"}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-8">
          {/* Grid infos principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 mb-4 sm:mb-8">
            {/* Colonne gauche */}
            <div className="space-y-4 sm:space-y-6">
              <InfoCard
                title="Organisateur"
                value={organizer || "N/A"}
                icon={<Users className="h-6 w-6 text-white" />}
                color="blue"
              />
              <InfoCard
                title="Thème"
                value={eventData.details || eventData.theme || "N/A"}
                icon={<BookOpen className="h-6 w-6 text-white" />}
                color="purple"
              />
              <InfoCard
                title="Categorie"
                value={eventData.type || "N/A"}
                icon={<Tag className="h-6 w-6 text-white" />}
                color="yellow"
              />
            </div>

            {/* Colonne droite */}
            <div className="space-y-4 sm:space-y-6">
              <InfoCard
                title="Salle"
                value={eventData.salle || "N/A"}
                icon={<MapPin className="h-6 w-6 text-white" />}
                color="teal"
              />
              <InfoCard
                title="Lieu"
                value={eventData.location || "N/A"}
                icon={<MapPin className="h-6 w-6 text-white" />}
                color="red"
              />
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <StatCard
              icon={<Star className="h-8 w-8 text-blue-200" />}
              value={eventData.personnels?.length || 0}
              label="Invités attendus"
              colorFrom="blue-500"
              colorTo="blue-600"
            />
            <StatCard
              icon={<Trophy className="h-8 w-8 text-emerald-200" />}
              value={eventData.personnels?.length || 0}
              label="Membres du personnel"
              colorFrom="emerald-500"
              colorTo="emerald-600"
            />
            <StatCard
              icon={<Target className="h-8 w-8 text-purple-200" />}
              value={eventData.tables?.length || 0}
              label="Tables disponibles"
              colorFrom="purple-500"
              colorTo="purple-600"
            />
          </div>
        </div>
      </div>
    </>
  );
};

// Composant réutilisable pour les infos principales
const InfoCard = ({ title, value, icon, color }) => (
  <div className={`flex flex-col sm:flex-row items-start sm:items-center p-4 bg-gradient-to-r from-${color}-50 to-${color}-100 rounded-2xl border border-${color}-200 hover:shadow-lg transition-all duration-300`}>
    <div className={`w-12 h-12 bg-gradient-to-r from-${color}-500 to-${color}-600 rounded-xl flex items-center justify-center mr-0 sm:mr-4 mb-2 sm:mb-0`}>
      {icon}
    </div>
    <div className="flex-1">
      <span className={`text-xs sm:text-sm font-medium text-${color}-800 uppercase tracking-wide`}>{title}</span>
      <p className="text-base sm:text-lg font-semibold text-gray-900">{value}</p>
    </div>
  </div>
);

// Composant réutilisable pour les statistiques
const StatCard = ({ icon, value, label, colorFrom, colorTo }) => (
  <div className={`bg-gradient-to-br from-${colorFrom} to-${colorTo} p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform`}>
    <div className="flex items-center justify-between mb-2">{icon}</div>
    <div className="text-2xl sm:text-3xl font-bold mb-1">{value}</div>
    <div className="text-white/90 text-xs sm:text-sm font-medium uppercase tracking-wide">{label}</div>
  </div>
);