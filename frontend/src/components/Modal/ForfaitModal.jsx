import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { format, isAfter } from 'date-fns';

const ForfaitModal = ({ forfaits, loading, onChoisir, onClose, activeForfait, expirationDate }) => {
  const isForfaitActive = activeForfait && expirationDate && isAfter(new Date(expirationDate), new Date());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white p-8 max-w-5xl w-full rounded-2xl shadow-2xl animate-fade-in overflow-y-auto max-h-[90vh] relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-3xl font-bold transition cursor-pointer"
        >
          ×
        </button>
        {isForfaitActive && (
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-lg mb-6 text-center">
            <p className="font-semibold">
              Vous avez un forfait actif ({activeForfait.nom.toUpperCase()}) jusqu'au{' '}
              {format(new Date(expirationDate), 'dd/MM/yyyy')}. Vous ne pouvez pas choisir un nouveau forfait avant son expiration.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {forfaits.map((f, index) => {
            const isActive = activeForfait && activeForfait.nom.toLowerCase() === f.nom.toLowerCase();

            return (
              <div
                key={f.id}
                className={`relative bg-white rounded-xl border p-6 shadow-lg transition-all hover:shadow-xl ${
                  index === 1 && !isActive ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'
                }`}
              >
                {index === 1 && !isActive && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                    Populaire
                  </div>
                )}
                {isActive && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                    Actif
                  </div>
                )}

                <h3 className="text-xl font-semibold text-center text-indigo-700 mb-2">
                  {f.nom.toUpperCase()}
                </h3>
                <p className="text-center text-gray-500 text-sm mb-4">
                  <span className="text-2xl font-bold text-indigo-600">{f.price} €</span>/mois
                </p>
                {isActive && expirationDate && (
                  <p className="text-center text-gray-500 text-sm mb-4">
                    Expire le : {format(new Date(expirationDate), 'dd/MM/yyyy')}
                  </p>
                )}

                <ul className="space-y-2 text-sm text-gray-700 mb-6">
                  <li className="flex gap-2 items-center">
                    <FaCheckCircle className="text-green-500" /> Invitations : {f.maxinvites ?? 'Illimité'}
                  </li>
                  <li className="flex gap-2 items-center">
                    <FaCheckCircle className="text-green-500" /> Événements : {f.maxevents ?? 'Illimité'}
                  </li>
                  <li className="flex gap-2 items-center">
                    <FaCheckCircle className="text-green-500" /> Durée : {f.validationduration} jours
                  </li>
                </ul>

                <button
                  disabled={loading || isForfaitActive}
                  onClick={() => onChoisir(f.nom)}
                  className={`w-full cursor-pointer py-3 rounded-lg font-semibold transition-all ${
                    isForfaitActive
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : loading
                      ? 'bg-gray-400 text-white cursor-wait'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                  title={isForfaitActive ? 'Un forfait est déjà actif jusqu\'à son expiration' : ''}
                >
                  {isForfaitActive ? 'Forfait Actif' : loading ? 'Chargement...' : 'Choisir ce forfait'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ForfaitModal;