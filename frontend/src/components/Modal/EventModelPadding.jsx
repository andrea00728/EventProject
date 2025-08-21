import React, { useState } from 'react';
import ImportGuestsCSVEvModif from '../../pages/choixModInvite/importationCsvEventModif';
import { useStateContext } from '../../context/ContextProvider';

const PendingEventModal = ({ isOpen, onClose, event }) => {
  const { token } = useStateContext();
  const [activeTab, setActiveTab] = useState('tables');
  const [isInviteFormOpen, setIsInviteFormOpen] = useState(false);

  const handleTableSubmit = async (e) => {
    e.preventDefault();
    const tableForm = { numero: e.target.numero.value, capacite: e.target.capacite.value, type: e.target.type.value, eventId: event.id };
    try {
      await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(tableForm),
      });
      onClose(); // Fermer après succès (à ajuster selon votre logique)
    } catch (err) {
      console.error('Erreur lors de l\'ajout de la table:', err);
    }
  };

  const openInviteForm = () => {
    setIsInviteFormOpen(true);
  };

  const closeInviteForm = () => {
    setIsInviteFormOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white mt-20 p-6 w-full max-w-4xl max-h-[500px] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-bold text-pink-600">Configuration de : {event.nom}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors duration-200" aria-label="Fermer">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Détails de l'événement */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-600">Date: {new Date(event.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          <p className="text-gray-600">Lieu: {event.location.nom}</p>
          <p className="text-gray-600">Salle: {event.salle.nom}</p>
        </div>

        {/* Onglets pour Tables et Invités */}
        <div className="mb-6">
          <div className="flex space-x-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('tables')}
              className={`pb-2 ${activeTab === 'tables' ? 'text-pink-600 border-b-2 border-pink-600 font-semibold' : 'text-gray-500 hover:text-pink-600 transition-colors'}`}
            >
              Tables
            </button>
            <button
              onClick={() => setActiveTab('invites')}
              className={`pb-2 ${activeTab === 'invites' ? 'text-pink-600 border-b-2 border-pink-600 font-semibold' : 'text-gray-500 hover:text-pink-600 transition-colors'}`}
            >
              Invités
            </button>
          </div>

          {/* Section Tables */}
          {activeTab === 'tables' && (
            <div className="mt-6">
              <form onSubmit={handleTableSubmit} className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label htmlFor="tableNumero" className="text-sm text-gray-700 mb-1">Numéro</label>
                    <input
                      id="tableNumero"
                      name="numero"
                      placeholder="Ex: 1, 2, A..."
                      className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-600"
                      required
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="tableCapacite" className="text-sm text-gray-700 mb-1">Capacité</label>
                    <input
                      id="tableCapacite"
                      name="capacite"
                      type="number"
                      placeholder="Ex: 4, 6, 8"
                      className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-600"
                      required
                      min="1"
                    />
                  </div>
                  <div className="flex flex-col md:col-span-2">
                    <label htmlFor="tableType" className="text-sm text-gray-700 mb-1">Type</label>
                    <select
                      id="tableType"
                      name="type"
                      className="border border-gray-200 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-indigo-600"
                    >
                      <option value="ronde">Ronde</option>
                      <option value="carree">Carrée</option>
                      <option value="rectangle">Rectangle</option>
                      <option value="ovale">Ovale</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="mt-4 w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-2 rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-colors"
                >
                  Ajouter la table
                </button>
              </form>
            </div>
          )}

          {/* Section Invités */}
          {activeTab === 'invites' && (
            <div className="mt-6">
              <div className="space-y-4">
                <ImportGuestsCSVEvModif eventId={event.id} onImportSuccess={onClose} />
              </div>
              {isInviteFormOpen && (
                <div className="mt-4">
                  <InviteFormWithId
                    onBack={closeInviteForm}
                    initialEventId={event.id} // Pré-remplir l'eventId
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PendingEventModal;