import React from 'react';
import { FaCheckCircle, FaCrown, FaStar, FaGem } from 'react-icons/fa';
import { format, isAfter } from 'date-fns';

const ForfaitModal = ({ forfaits, loading, onChoisir, onClose, activeForfait, expirationDate }) => {
  const isForfaitActive = activeForfait && expirationDate && isAfter(new Date(expirationDate), new Date());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div className="bg-gradient-to-br from-white via-slate-50 to-indigo-50/30 p-8 max-w-6xl w-full rounded-3xl shadow-2xl animate-fade-in overflow-y-auto max-h-[90vh] relative border border-white/20">
        
        {/* Décorations d'arrière-plan */}
        <div className="absolute top-6 left-6 w-32 h-32 bg-gradient-to-r from-[#FB9E3A]/10 to-orange-400/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-6 right-6 w-28 h-28 bg-gradient-to-l from-indigo-400/15 to-purple-400/10 rounded-full blur-xl animate-pulse delay-1000" />
        
        {/* Bouton fermer - identique */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-3xl font-bold transition cursor-pointer"
        >
          ×
        </button>

        {/* En-tête */}
        <div className="text-center mb-12 relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-indigo-100 rounded-full px-4 py-2 text-sm font-medium text-indigo-700 shadow-sm mb-4">
            <FaCrown className="w-4 h-4 text-[#FB9E3A]" />
            Choisissez votre forfait
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-black text-slate-800 leading-tight tracking-tight mb-4">
            Plans &
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FB9E3A] via-orange-500 to-amber-500"> Tarifs</span>
          </h2>
          
          <p className="text-slate-600 text-lg leading-relaxed max-w-2xl mx-auto">
            Sélectionnez le forfait qui correspond le mieux à vos besoins d'organisation d'événements
          </p>
        </div>

        {/* Notification forfait actif - design amélioré mais logique identique */}
        {isForfaitActive && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 text-blue-700 rounded-2xl p-6 mb-8 text-center shadow-sm">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-black text-slate-800">Forfait Actif</span>
            </div>
            <p className="font-semibold text-slate-700">
              Vous avez un forfait actif ({activeForfait.nom.toUpperCase()}) jusqu'au{' '}
              {format(new Date(expirationDate), 'dd/MM/yyyy')}. Vous ne pouvez pas choisir un nouveau forfait avant son expiration.
            </p>
          </div>
        )}

        {/* Grille des forfaits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
          {forfaits.map((f, index) => {
            const isActive = activeForfait && activeForfait.nom.toLowerCase() === f.nom.toLowerCase();
            const isPopular = index === 1;
            const isPremium = index === 3;

            return (
              <div
                key={f.id}
                className={`group relative bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border overflow-hidden hover:scale-105 ${
                  isPopular && !isActive 
                    ? 'border-indigo-400 bg-gradient-to-br from-white to-indigo-50/50 shadow-indigo-500/20' 
                    : isPremium && !isActive
                    ? 'border-[#FB9E3A] bg-gradient-to-br from-white to-orange-50/50 shadow-orange-500/20'
                    : isActive
                    ? 'border-green-400 bg-gradient-to-br from-white to-green-50/50 shadow-green-500/20'
                    : 'border-gray-200 hover:border-slate-300'
                }`}
              >
                {isActive && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg animate-pulse">
                    Actif
                  </div>
                )}

                {/* Décoration de fond */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Contenu - structure identique, styling amélioré */}
                <div className="relative z-10">
                  <h3 className="text-2xl font-black text-center text-slate-800 mb-4 group-hover:text-indigo-600 transition-colors">
                    {f.nom.toUpperCase()}
                  </h3>
                  
                  <div className="text-center mb-6">
                    <span className="text-4xl font-black text-slate-800">{f.price}</span>
                    <span className="text-slate-500 text-lg font-semibold"> €/mois</span>
                  </div>
                  
                  {isActive && expirationDate && (
                    <div className="text-center mb-6">
                      <div className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-2 rounded-full inline-block">
                        Expire le : {format(new Date(expirationDate), 'dd/MM/yyyy')}
                      </div>
                    </div>
                  )}

                  {/* Features */}
                  <ul className="space-y-3 text-sm text-slate-700 mb-8">
                    <li className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                        <FaCheckCircle className="text-green-500 text-xs" />
                      </div>
                      <span>Invitations : <span className="font-bold text-indigo-600">{f.maxinvites ?? 'Illimité'}</span></span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                        <FaCheckCircle className="text-green-500 text-xs" />
                      </div>
                      <span>Événements : <span className="font-bold text-indigo-600">{f.maxevents ?? 'Illimité'}</span></span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                        <FaCheckCircle className="text-green-500 text-xs" />
                      </div>
                      <span>Durée : <span className="font-bold text-indigo-600">{f.validationduration} jours</span></span>
                    </li>
                  </ul>

                  {/* Bouton - même logique, design amélioré */}
                  <button
                    disabled={loading || isForfaitActive}
                    onClick={() => onChoisir(f.nom)}
                    className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 ${
                      isForfaitActive
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : loading
                        ? 'bg-gray-400 text-white cursor-wait'
                        : isPopular
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-indigo-500/25'
                        : isPremium
                        ? 'bg-gradient-to-r from-[#FB9E3A] to-orange-500 text-white hover:from-orange-500 hover:to-amber-500 shadow-orange-500/25'
                        : 'bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:from-slate-700 hover:to-slate-800'
                    }`}
                    title={isForfaitActive ? 'Un forfait est déjà actif jusqu\'à son expiration' : ''}
                  >
                    {isForfaitActive ? 'Forfait Actif' : loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Chargement...
                      </div>
                    ) : 'Choisir ce forfait'}
                  </button>
                </div>

                {/* Éléments décoratifs pour les forfaits premium */}
                {(isPopular || isPremium) && (
                  <>
                    <div className="absolute top-4 right-4 w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>  
                    <div className="absolute bottom-6 left-6 w-3 h-3 bg-white/40 rounded-full animate-bounce delay-300"></div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer informatif */}
        <div className="text-center mt-12 pt-8 border-t border-slate-200/50">
          <p className="text-slate-500 text-sm">
            🔒 <span className="font-semibold">Paiement sécurisé</span> • 
            <span className="mx-2">💳</span> <span className="font-semibold">Toutes cartes acceptées</span> • 
            <span className="mx-2">🔄</span> <span className="font-semibold">Résiliation à tout moment</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForfaitModal;
