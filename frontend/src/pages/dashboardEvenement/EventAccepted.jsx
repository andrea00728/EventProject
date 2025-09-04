import React, { useState, useEffect } from 'react';
import { getMyEvents, updateEvent } from '../../services/evenementServ';
import { useStateContext } from '../../context/ContextProvider';
import Modal from '../../components/Modal/EventModal';
import DeleteEventButton from '../../util/DeleteEvenement';

const EventAccept = () => {
  const { isAuthenticated, user } = useStateContext();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setError("Authentification requise pour voir les événements.");
      setIsLoading(false);
      return;
    }

    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const data = await getMyEvents();
        setEvents(data);
        setError(null);
      } catch (error) {
        console.error('Erreur lors de la récupération des événements:', error);
        setError(error || "Erreur lors du chargement des événements.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [isAuthenticated]);

  const openModal = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const openEditModal = (event) => {
    setEditEvent({
      id: event.id,
      nom: event.nom,
      type: event.type,
      theme: event.theme,
      date: new Date(event.date).toISOString().slice(0, 16),
      date_fin: new Date(event.date_fin).toISOString().slice(0, 16),
      locationId: event.location.id,
      salleId: event.salle.id,
      isPublic: event.isPublic,
      montanttransaction: event.montanttransaction,
      imageUrl: event.imageUrl,
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditEvent(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!user || !user.id) {
      setError("Utilisateur non authentifié. Veuillez vous reconnecter.");
      setIsLoading(false);
      return;
    }

    try {
      // Formater les dates en ISO complet
      const formattedDate = new Date(editEvent.date).toISOString();
      const formattedDateFin = new Date(editEvent.date_fin).toISOString();

      const updatedEvent = await updateEvent(editEvent.id, {
        utilisateur_id: user.id,
        nom: editEvent.nom,
        type: editEvent.type,
        theme: editEvent.theme,
        date: formattedDate,
        date_fin: formattedDateFin,
        locationId: Number(editEvent.locationId),
        salleId: Number(editEvent.salleId),
        isPublic: editEvent.isPublic,
        montanttransaction: editEvent.montanttransaction ? Number(editEvent.montanttransaction) : undefined,
        image: editEvent.image,
      });
      setEvents(events.map((e) => (e.id === updatedEvent.id ? updatedEvent : e)));
      closeEditModal();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'événement:', error);
      setError(error || "Erreur lors de la mise à jour de l'événement.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Mes Événements
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Gérez et consultez tous vos événements créés en un seul endroit
          </p>
        </div>

        {isLoading && (
          <div className="flex flex-col justify-center items-center h-96">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-200 rounded-full animate-spin border-t-purple-500"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-pink-200 rounded-full animate-spin border-t-pink-500 animate-reverse" style={{ animationDelay: '0.15s' }}></div>
            </div>
            <p className="mt-4 text-slate-600 font-medium">Chargement de vos événements...</p>
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-red-800 font-semibold">Erreur de chargement</h3>
                  <p className="text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!isLoading && !error && (
          <>
            {events.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full mb-6">
                  <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-600 mb-2">Aucun événement trouvé</h3>
                <p className="text-slate-500">Vous n'avez pas encore créé d'événements.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 items-stretch">
                {events.map((event, index) => (
                  <div
                    key={event.id}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 overflow-hidden transform hover:-translate-y-1 h-full flex flex-col"
                  >
                    <div className={`h-2 bg-gradient-to-r ${index % 5 === 0 ? 'from-blue-500 to-purple-500' :
                        index % 5 === 1 ? 'from-purple-500 to-pink-500' :
                          index % 5 === 2 ? 'from-pink-500 to-orange-500' :
                            index % 5 === 3 ? 'from-orange-500 to-amber-500' :
                              'from-amber-500 to-blue-500'
                      }`}></div>

                    <div className="p-6 relative">
                      <div className="flex items-start justify-between mb-6">
                        <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wide leading-tight">
                          {event.nom}
                        </h2>
                        <div className={`w-3 h-3 rounded-full ${index % 5 === 0 ? 'bg-blue-500' :
                            index % 5 === 1 ? 'bg-purple-500' :
                              index % 5 === 2 ? 'bg-pink-500' :
                                index % 5 === 3 ? 'bg-orange-500' :
                                  'bg-amber-500'
                          }`}></div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Type</p>
                            <p className="text-slate-800 font-semibold">{event.type}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Thème</p>
                            <p className="text-slate-800 font-semibold">{event.theme}</p>
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
                              {new Date(event.date).toLocaleDateString('fr-FR', {
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
                            <p className="text-slate-800 font-semibold">{event.location?.nom.split(",").slice(0, 2).join(", ") || "Non précisé"}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Salle</p>
                            <p className="text-slate-800 font-semibold">{event.salle.nom}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openModal(event)}
                            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 shadow-lg ${index % 5 === 0 ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600' :
                              index % 5 === 1 ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' :
                                index % 5 === 2 ? 'bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600' :
                                  index % 5 === 3 ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600' :
                                    'bg-gradient-to-r from-amber-500 to-blue-500 hover:from-amber-600 hover:to-blue-600'
                            }`}
                            aria-label={`Voir les tables pour l'événement ${event.nom}`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Voir les tables
                          </button>
                          <button
                            onClick={() => openEditModal(event)}
                            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 shadow-lg bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600`}
                            aria-label={`Modifier l'événement ${event.nom}`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Modifier
                          </button>
                        </div>
                        <DeleteEventButton
                          eventId={event.id}
                          onDeleted={(deletedId) =>
                            setEvents(events.filter((e) => e.id !== deletedId))
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {selectedEvent && (
          <Modal isOpen={isModalOpen} onClose={closeModal} event={selectedEvent} />
        )}

        {editEvent && (
          <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isEditModalOpen ? '' : 'hidden'}`}>
            <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Modifier l'événement</h2>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600">Nom</label>
                  <input
                    type="text"
                    value={editEvent.nom}
                    onChange={(e) => setEditEvent({ ...editEvent, nom: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600">Type</label>
                  <select
                    value={editEvent.type}
                    onChange={(e) => setEditEvent({ ...editEvent, type: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="mariage">Mariage</option>
                    <option value="reunion">Réunion</option>
                    <option value="anniversaire">Anniversaire</option>
                    <option value="engagement">Engagement</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600">Thème</label>
                  <input
                    type="text"
                    value={editEvent.theme}
                    onChange={(e) => setEditEvent({ ...editEvent, theme: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600">Date de début</label>
                  <input
                    type="datetime-local"
                    value={editEvent.date}
                    onChange={(e) => setEditEvent({ ...editEvent, date: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600">Date de fin</label>
                  <input
                    type="datetime-local"
                    value={editEvent.date_fin}
                    onChange={(e) => setEditEvent({ ...editEvent, date_fin: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600">Lieu (ID)</label>
                  <input
                    type="number"
                    value={editEvent.locationId}
                    onChange={(e) => setEditEvent({ ...editEvent, locationId: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600">Salle (ID)</label>
                  <input
                    type="number"
                    value={editEvent.salleId}
                    onChange={(e) => setEditEvent({ ...editEvent, salleId: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600">Public</label>
                  <input
                    type="checkbox"
                    checked={editEvent.isPublic}
                    onChange={(e) => setEditEvent({ ...editEvent, isPublic: e.target.checked })}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600">Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditEvent({ ...editEvent, image: e.target.files[0] })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="px-6 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:from-green-600 hover:to-teal-600 transition disabled:opacity-50"
                  >
                    {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventAccept;