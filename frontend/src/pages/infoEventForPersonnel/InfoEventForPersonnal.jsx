import React, { useState, useEffect } from "react";
import { useStateContext } from "../../context/ContextProvider";
import { Users, Calendar, MapPin, Clock, FileText, Star, Trophy, Target } from "lucide-react";
import { url } from "../../api/url";
import defaultImage from "../../assets/images/bouquet.jpg";

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
          `https://api.mastertable.site/personnel/events-by-email?email=${encodeURIComponent(personnelEmail)}`
        );

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || "Erreur inconnue");
        }

        const data = await res.json();
        setEventData(data);
        console.log("Données de l'événement récupérées :", data);
      
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
    <div className="p-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Informations de l'Événement : {eventData.eventName}</h1>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden backdrop-blur-sm border border-white/20">
          {/* Image en background */}
          <div
            className="relative h-64 bg-cover bg-center"
            style={{
              backgroundImage: `url(${eventData.image ? url + eventData.image : defaultImage})`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            <div className="absolute bottom-6 left-6 text-white">
              <h2 className="text-3xl font-bold mb-2">{eventData.eventName}</h2>
              <div className="flex items-center space-x-4 text-white/90">
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date(eventData.date).toLocaleDateString()}
                </span>
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  {new Date(eventData.date).toLocaleTimeString()} -{" "}
                  {eventData.date_fin
                    ? new Date(eventData.date_fin).toLocaleTimeString()
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Grid infos principales */}
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              <div className="space-y-6">
                <InfoCard title="Organisateur" value={organizer} icon={<Users className="h-6 w-6 text-white" />} color="blue" />
                <InfoCard title="Date" value={new Date(eventData.date).toLocaleDateString()} icon={<Calendar className="h-6 w-6 text-white" />} color="purple" />
              </div>

              <div className="space-y-6">
                <InfoCard title="Horaire" value={`${new Date(eventData.date).toLocaleTimeString()} - ${eventData.date_fin ? new Date(eventData.date_fin).toLocaleTimeString() : "N/A"}`} icon={<Clock className="h-6 w-6 text-white" />} color="orange" />
                <InfoCard title="Lieu" value={eventData.location || "N/A"} icon={<MapPin className="h-6 w-6 text-white" />} color="red" />
                <InfoCard title="Salle" value={eventData.salle || "N/A"} icon={<MapPin className="h-6 w-6 text-white" />} color="teal" />
              </div>
            </div>

            {/* Détails */}
            <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 rounded-2xl p-6 border border-indigo-200 mb-8">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Détails de l'événement</h3>
                  <div className="bg-white/70 backdrop-blur p-6 rounded-xl border border-white/50">
                    <p className="text-gray-700 leading-relaxed text-lg">{eventData.details || eventData.theme}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistiques */}
            <div className="grid md:grid-cols-3 gap-6">
              <StatCard icon={<Star className="h-8 w-8 text-blue-200" />} value={eventData.personnels?.length || 0} label="Invités attendus" colorFrom="blue-500" colorTo="blue-600" />
              <StatCard icon={<Trophy className="h-8 w-8 text-emerald-200" />} value={eventData.personnels?.length || 0} label="Membres du personnel" colorFrom="emerald-500" colorTo="emerald-600" />
              <StatCard icon={<Target className="h-8 w-8 text-purple-200" />} value={eventData.tables?.length || 0} label="Tables disponibles" colorFrom="purple-500" colorTo="purple-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant réutilisable pour les infos principales
const InfoCard = ({ title, value, icon, color }) => (
  <div className={`flex items-center p-4 bg-gradient-to-r from-${color}-50 to-${color}-100 rounded-2xl border border-${color}-200 hover:shadow-lg transition-all duration-300`}>
    <div className={`w-12 h-12 bg-gradient-to-r from-${color}-500 to-${color}-600 rounded-xl flex items-center justify-center mr-4`}>
      {icon}
    </div>
    <div className="flex-1">
      <span className={`text-sm font-medium text-${color}-800 uppercase tracking-wide`}>{title}</span>
      <p className="text-lg font-semibold text-gray-900">{value}</p>
    </div>
  </div>
);

// Composant réutilisable pour les statistiques
const StatCard = ({ icon, value, label, colorFrom, colorTo }) => (
  <div className={`bg-gradient-to-br from-${colorFrom} to-${colorTo} p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform`}>
    <div className="flex items-center justify-between mb-4">{icon}</div>
    <div className="text-3xl font-bold mb-1">{value}</div>
    <div className="text-white/90 text-sm font-medium uppercase tracking-wide">{label}</div>
  </div>
);
