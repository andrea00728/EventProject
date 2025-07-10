import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';

const ForfaitModal = ({ forfaits, loading, onChoisir, onClose, activeNom }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur">
      <div className="bg-white p-10 max-w-7xl w-full shadow-2xl animate-fade-in overflow-y-auto max-h-[90vh] relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {forfaits.map((f, index) => {
            const isActive = activeNom && activeNom.toLowerCase() === f.nom.toLowerCase();

            return (
              <div
                key={f.id}
                className={`relative bg-white rounded-xl border p-8 shadow-lg transition-all hover:shadow-xl ${
                  index === 1 ? 'border-indigo-600 bg-indigo-50 scale-[1.02]' : ''
                }`}
              >
                {/* Badge populaire */}
                {index === 1 && !isActive && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white text-xs px-4 py-1 rounded-full shadow">
                    ⭐ Populaire
                  </div>
                )}

                {/* Badge actif */}
                {isActive && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs px-4 py-1 rounded-full shadow">
                    ✅ Forfait actif
                  </div>
                )}

                <h3 className="text-2xl font-semibold text-center text-indigo-700 mb-2">
                  {f.nom.toUpperCase()}
                </h3>
                <p className="text-center text-gray-500 text-sm mb-6">
                  À partir de <span className="text-indigo-600 font-bold text-lg">{f.price} €</span>
                </p>

                <ul className="space-y-3 text-sm text-gray-700 mb-6">
                  <li className="flex gap-2 items-center">
                    <FaCheckCircle className="text-green-500" /> Invitations : {f.maxinvites ?? '∞'}
                  </li>
                  <li className="flex gap-2 items-center">
                    <FaCheckCircle className="text-green-500" /> Événements : {f.maxevents ?? '∞'}
                  </li>
                  <li className="flex gap-2 items-center">
                    <FaCheckCircle className="text-green-500" /> Durée : {f.validationduration} jours
                  </li>
                </ul>

                <button
                  disabled={loading || isActive}
                  onClick={() => onChoisir(f.nom)}
                  className={`w-full py-2 rounded-lg font-semibold transition ${
                    isActive
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
                  }`}
                >
                  {isActive ? 'Déjà activé' : loading ? 'Redirection...' : 'Choisir ce forfait'}
                </button>
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-2xl font-bold"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default ForfaitModal;