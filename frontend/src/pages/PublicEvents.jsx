import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const PublicEvents = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: ''
  });
  const [registrationStatus, setRegistrationStatus] = useState(null);

  useEffect(() => {
    const fetchPublicEvents = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:3000/evenements/publics');
        setEvents(response.data);
        setError(null);
      } catch (error) {
        console.error('Erreur lors de la récupération des événements publics :', error);
        setError("Impossible de charger les événements publics. Veuillez réessayer plus tard.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublicEvents();
  }, []);

  const openEventModal = (event) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  const closeEventModal = () => {
    setIsEventModalOpen(false);
    setSelectedEvent(null);
  };

  const openRegistrationModal = () => {
    setIsRegistrationModalOpen(true);
    setIsEventModalOpen(false);
    setRegistrationStatus(null);
  };

  const closeRegistrationModal = () => {
    setIsRegistrationModalOpen(false);
    setFormData({ nom: '', prenom: '', email: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Simulation d'envoi de données
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Ici vous pourriez faire un appel API réel :
      // await axios.post(`http://localhost:3000/evenements/${selectedEvent.id}/inscriptions`, formData);

      setRegistrationStatus('success');
      setFormData({ nom: '', prenom: '', email: '' });
    } catch (error) {
      console.error("Erreur lors de l'inscription :", error);
      setRegistrationStatus('error');
    }
  };


  /*******************/
  const [showTableModal, setShowTableModal] = useState(false);
  const [showPlaceModal, setShowPlaceModal] = useState(false);
  const [tables, setTables] = useState([]); // Supposons que vous avez une liste de tables
  const [selectedTable, setSelectedTable] = useState(null);
  const [places, setPlaces] = useState([]); // Supposons que vous avez une liste de places

  const handleTableClick = () => {
    // Ici vous pourriez faire un appel API pour récupérer les tables si ce n'est pas déjà fait
    setShowTableModal(true);
  };

  const handlePlaceClick = () => {
    if (selectedTable?.places?.length > 0) {
      setPlaces(selectedTable.places); // Ou récupérer les places disponibles pour cette table
      setShowPlaceModal(true);
    }
  };

  const selectTable = (table) => {
    setSelectedTable(table);
    setShowTableModal(false);
  };

  const selectPlace = (place) => {
    // Mettre à jour l'état avec la place sélectionnée
    setShowPlaceModal(false);
  };

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
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 overflow-hidden transform hover:-translate-y-1 cursor-pointer"
                    onClick={() => openEventModal(event)}
                  >
                    {/* Card Header */}
                    <div className={`h-2 bg-gradient-to-r ${event.id % 3 === 0 ? 'from-indigo-500 to-cyan-500' :
                      event.id % 3 === 1 ? 'from-pink-500 to-rose-500' :
                        'from-emerald-500 to-lime-500'
                      }`}
                    ></div>

                    <div className="p-6">
                      <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wide mb-4">
                        {event.nom}
                      </h2>

                      <div className="space-y-2">
                        <p><span className="text-slate-500 font-medium">Type :</span> {event.type}</p>
                        <p><span className="text-slate-500 font-medium">Thème :</span> {event.theme}</p>
                        <p>
                          <span className="text-slate-500 font-medium">Date :</span>{' '}
                          {new Date(event.date).toLocaleDateString("fr-FR", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <p><span className="text-slate-500 font-medium">Lieu :</span> {event.location.nom || "Non précisé"}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Event Modal */}
      {isEventModalOpen && selectedEvent && (
        <AnimatePresence>
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={closeEventModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              {/* <div className={`h-2 bg-gradient-to-r ${selectedEvent.id % 3 === 0 ? 'from-indigo-500 to-cyan-500' :
                selectedEvent.id % 3 === 1 ? 'from-pink-500 to-rose-500' :
                  'from-emerald-500 to-lime-500'
                }`}
              ></div> */}

              <div className="p-6">
                {/* Event Title */}
                <div className="flex items-start justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-wide leading-tight">
                    {selectedEvent.nom}
                  </h2>
                  <button
                    onClick={closeEventModal}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Event Description */}
                {selectedEvent.description && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">Description</h3>
                    <p className="text-slate-600">{selectedEvent.description}</p>
                  </div>
                )}

                {/* Event Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Type</p>
                      <p className="text-slate-800 font-semibold">{selectedEvent.type}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-4.244-4.243A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Thème</p>
                      <p className="text-slate-800 font-semibold">{selectedEvent.theme}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Date</p>
                      <p className="text-slate-800 font-semibold">
                        {new Date(selectedEvent.date).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Lieu</p>
                      <p className="text-slate-800 font-semibold">
                        {selectedEvent.lieu || selectedEvent.location?.nom || "Non précisé"}
                      </p>
                    </div>
                  </div>

                  {selectedEvent.salle?.nom && (
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Salle</p>
                        <p className="text-slate-800 font-semibold">{selectedEvent.salle.nom}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100">
                  <button
                    onClick={openRegistrationModal}
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 shadow-lg ${selectedEvent.id % 5 === 0 ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600' :
                      selectedEvent.id % 5 === 1 ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' :
                        selectedEvent.id % 5 === 2 ? 'bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600' :
                          selectedEvent.id % 5 === 3 ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600' :
                            'bg-gradient-to-r from-amber-500 to-blue-500 hover:from-amber-600 hover:to-blue-600'
                      }`}
                    aria-label={`S'inscrire à l'événement ${selectedEvent.nom}`}
                  >
                    S'inscrire
                  </button>

                  <button
                    onClick={closeEventModal}
                    className="px-6 py-3 rounded-xl font-medium text-slate-600 hover:text-slate-800 transition-colors duration-200"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </motion.div >
          </div>
        </AnimatePresence>
      )}

      {/* Registration Modal */}
      {isRegistrationModalOpen && selectedEvent && (
        <AnimatePresence>
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={closeRegistrationModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-6xl mx-4 overflow-hidden max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              {/* <div className={`h-2 bg-gradient-to-r ${selectedEvent.id % 3 === 0 ? 'from-indigo-500 to-cyan-500' :
                selectedEvent.id % 3 === 1 ? 'from-pink-500 to-rose-500' :
                  'from-emerald-500 to-lime-500'
                }`}
              ></div> */}

              <div className='flex flex-col lg:flex-row'>
                {/* Image Section - Hidden on mobile */}
                <div className='hidden lg:block lg:w-1/2 bg-gray-100'>
                  <img
                    src="/images/IMG1.jpg"
                    alt="Événement"
                    className='w-full h-full object-cover max-h-[65vh]'
                  />
                </div>

                {/* Form Section */}
                <div className='w-full lg:w-1/2 p-4 sm:p-6'>
                  <div className="flex items-start justify-between mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 uppercase tracking-wide leading-tight">
                      Inscription à {selectedEvent.nom}
                    </h2>
                    <button
                      onClick={closeRegistrationModal}
                      className="text-slate-400 hover:text-slate-600 ml-4"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4 mb-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-700 mb-1">Nom <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          name="nom"
                          value={formData.nom}
                          onChange={handleInputChange}
                          required
                          placeholder="Votre nom"
                          className="border border-gray-300 rounded-lg sm:rounded-xl px-4 py-2 sm:px-5 sm:py-3 focus:ring-2 focus:ring-indigo-200 transition"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-700 mb-1">Prénom <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          name="prenom"
                          value={formData.prenom}
                          onChange={handleInputChange}
                          required
                          placeholder="Votre prénom"
                          className="border border-gray-300 rounded-lg sm:rounded-xl px-4 py-2 sm:px-5 sm:py-3 focus:ring-2 focus:ring-indigo-200 transition"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          placeholder="Votre email"
                          className="border border-gray-300 rounded-lg sm:rounded-xl px-4 py-2 sm:px-5 sm:py-3 focus:ring-2 focus:ring-indigo-200 transition"
                        />
                      </div>

                      <div>
                        {/* Table */}
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-semibold text-gray-700 mb-1">Table <span className="text-red-500">*</span></label>
                          <div
                            onClick={handleTableClick}
                            className="border border-gray-300 rounded-lg sm:rounded-xl px-4 py-2 sm:px-5 sm:py-3 bg-gray-50 cursor-pointer focus:ring-2 focus:ring-indigo-200 transition"
                          >
                            {selectedTable?.nom || "Sélectionner une table"}
                          </div>
                        </div>

                        {/* Place */}
                        {selectedTable && (
                          <div className="flex flex-col gap-2 mt-4">
                            <label className="text-sm font-semibold text-gray-700 mb-1">Place <span className="text-red-500">*</span></label>
                            <div
                              onClick={handlePlaceClick}
                              className={`border border-gray-300 rounded-lg sm:rounded-xl px-4 py-2 sm:px-5 sm:py-3 bg-gray-50 focus:ring-2 focus:ring-indigo-200 transition ${selectedTable.places?.length > 0 ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                }`}
                            >
                              {selectedEvent.salle?.nom || "Sélectionner une place"}
                            </div>
                          </div>
                        )}

                        {/* Modal pour les tables */}
                        {showTableModal && (
                          <AnimatePresence>
                            <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center p-4 z-50">
                              <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0 }}
                                transition={{ duration: 0.3 }} 
                                className="bg-white rounded-lg p-6 w-full max-w-md">
                                <h2 className="text-xl font-bold mb-4">Liste des tables</h2>
                                <div className="max-h-96 overflow-y-auto">
                                  {tables.length > 0 ? (
                                    tables.map((table) => (
                                      <div
                                        key={table.id}
                                        onClick={() => selectTable(table)}
                                        className="p-3 border-b border-gray-200 hover:bg-gray-100 cursor-pointer"
                                      >
                                        {table.nom} - {table.places?.length || 0} places disponibles
                                      </div>
                                    ))
                                  ) : (
                                    <p>Aucune table disponible</p>
                                  )}
                                </div>
                                <button
                                  onClick={() => setShowTableModal(false)}
                                  className="mt-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                                >
                                  Fermer
                                </button>
                              </motion.div>
                            </div>
                          </AnimatePresence>
                        )}

                        {/* Modal pour les places */}
                        {showPlaceModal && (
                          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                              <h2 className="text-xl font-bold mb-4">Places disponibles pour {selectedTable.nom}</h2>
                              <div className="max-h-96 overflow-y-auto">
                                {places.length > 0 ? (
                                  places.map((place) => (
                                    <div
                                      key={place.id}
                                      onClick={() => selectPlace(place)}
                                      className="p-3 border-b border-gray-200 hover:bg-gray-100 cursor-pointer"
                                    >
                                      {place.nom}
                                    </div>
                                  ))
                                ) : (
                                  <p>Aucune place disponible</p>
                                )}
                              </div>
                              <button
                                onClick={() => setShowPlaceModal(false)}
                                className="mt-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                              >
                                Fermer
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="relative flex flex-col sm:flex-row items-center gap-4 pt-6 mt-6 border-t border-slate-100">
                      <button
                        type="submit"
                        className={`absolute top-5 right-0  w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg sm:rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 shadow-lg ${selectedEvent.id % 5 === 0 ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600' :
                          selectedEvent.id % 5 === 1 ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' :
                            selectedEvent.id % 5 === 2 ? 'bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600' :
                              selectedEvent.id % 5 === 3 ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600' :
                                'bg-gradient-to-r from-amber-500 to-blue-500 hover:from-amber-600 hover:to-blue-600'
                          }`}
                      >
                        Confirmer l'inscription
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default PublicEvents;