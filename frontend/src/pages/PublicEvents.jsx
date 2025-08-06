import React, { useEffect, useState } from 'react';
import axios from 'axios';


const PublicEvents = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPublicEvents = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/evenements/publics`);
        setEvents(response.data);
        setError(null);
      } catch (error) {
        console.error('Erreur lors de la récupération des événements publics :', error);
        setError("Impossible de charger les événements publics.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublicEvents();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent mb-4">
            Événements Publics
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Découvrez tous les événements ouverts au public
          </p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center py-24">
            <div className="w-16 h-16 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-500"></div>
            <p className="mt-4 text-slate-600 font-medium">Chargement des événements publics...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-red-800 font-semibold">Erreur de chargement</h3>
                  <p className="text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Events */}
        {!isLoading && !error && (
          <>
            {events.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full mb-6">
                  <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-600 mb-2">Aucun événement public</h3>
                <p className="text-slate-500">Revenez plus tard pour découvrir de nouveaux événements.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {events.map((event, index) => (
                  <div
                    key={event.id}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 overflow-hidden transform hover:-translate-y-1"
                  >
                    {/* Card Header */}
                    <div className={`h-2 bg-gradient-to-r ${
                      index % 3 === 0 ? 'from-indigo-500 to-cyan-500' :
                      index % 3 === 1 ? 'from-pink-500 to-rose-500' :
                      'from-emerald-500 to-lime-500'
                    }`}></div>

                    <div className="p-6">
                      <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wide mb-4">
                        {event.nom}
                      </h2>

                      <div className="space-y-2">
                        <p><span className="text-slate-500 font-medium">Type :</span> {event.type}</p>
                        <p><span className="text-slate-500 font-medium">Thème :</span> {event.theme}</p>
                        <p><span className="text-slate-500 font-medium">Date :</span>{' '}
                          {new Date(event.date).toLocaleDateString("fr-FR", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <p><span className="text-slate-500 font-medium">Lieu :</span> {event.lieu || "Non précisé"}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PublicEvents;
