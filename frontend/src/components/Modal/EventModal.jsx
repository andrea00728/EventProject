import React from 'react';

const EventModal = ({ isOpen, onClose, event }) => {
  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[500px] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-pink-600">
            Tables pour l'événement: {event?.nom}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
            aria-label="Fermer la modale"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Section des tables */}
        {event?.tables?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {event.tables.map((table) => (
              <div
                key={table.id}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
              >
                <p className="font-semibold text-gray-800">Table {table.numero}</p>
                <p className="text-gray-600">Type: {table.type}</p>
                <p className="text-gray-600">Capacité: {table.capacite}</p>
                <p className="text-gray-600">Places réservées: {table.placeReserve}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 mb-6">Aucune table assignée à cet événement.</p>
        )}

        {/* Section des invités (si présents) */}
        {event?.invites?.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-pink-600 mb-4">Invités</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {event.invites.map((invite) => (
                <div
                  key={invite.id}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                >
                  <p className="font-semibold text-gray-800">
                    {invite.prenom} {invite.nom}
                  </p>
                  <p className="text-gray-600">Email: {invite.email}</p>
                  <p className="text-gray-600">Sexe: {invite.sex === 'M' ? 'Homme' : 'Femme'}</p>
                  <p className="text-gray-600">Place: {invite.place}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventModal;
