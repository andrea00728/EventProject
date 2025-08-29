import React from 'react';
import { FaCcPaypal, FaCcStripe, FaCheckCircle, FaCreditCard, FaCrown } from 'react-icons/fa';
import { format, isAfter } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const ForfaitModal = ({ forfaits, loading, onChoisir, onClose, activeForfait, expirationDate }) => {
  const isForfaitActive = activeForfait && expirationDate && isAfter(new Date(expirationDate), new Date());
  const [selectedForfait, setSelectedForfait] = React.useState(null);
  const [openPaymentModal, setOpenPaymentModal] = React.useState(false);

  const handlePaymentModal = (forfait) => {
    setSelectedForfait(forfait);
    setOpenPaymentModal(true);
  };

  return (
    <AnimatePresence>
      {/* Modal principal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-br from-white via-slate-50 to-indigo-50/30 p-8 max-w-6xl w-full rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh] relative border border-white/20"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-3xl font-bold transition cursor-pointer"
          >
            ×
          </button>

          <div className="text-center mb-12 relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-indigo-100 rounded-full px-4 py-2 text-sm font-medium text-indigo-700 shadow-sm mb-4">
              <FaCrown className="w-4 h-4 text-[#FB9E3A]" />
              Choisissez votre forfait
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-800 leading-tight tracking-tight mb-4">
              Plans &
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FB9E3A] via-orange-500 to-amber-500"> Tarifs</span>
            </h2>
          </div>

          {/* Notification forfait actif */}
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
                  className={`group relative bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border overflow-hidden hover:scale-105 ${isPopular && !isActive
                    ? 'border-indigo-400 bg-gradient-to-br from-white to-indigo-50/50 shadow-indigo-500/20'
                    : isPremium && !isActive
                      ? 'border-[#FB9E3A] bg-gradient-to-br from-white to-orange-50/50 shadow-orange-500/20'
                      : isActive
                        ? 'border-green-400 bg-gradient-to-br from-white to-green-50/50 shadow-green-500/20'
                        : 'border-gray-200 hover:border-slate-300'
                    }`}
                >
                  {isActive && (
                    <div className="absolute text-center w-1/2 pt-5 -top-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg animate-pulse">
                      Actif
                    </div>
                  )}

                  <div className="relative z-10 flex-col items-center justify-between h-full">
                    <div>
                      <h3 className="text-2xl font-black text-center text-slate-800 mb-4 group-hover:text-indigo-600 transition-colors">
                        {f.nom.toUpperCase()}
                      </h3>
                      <div className="text-center mb-6">
                        <span className="text-4xl font-black text-slate-800">{f.price}</span>
                        <span className="text-slate-500 text-lg font-semibold"> €/mois</span>
                      </div>

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
                    </div>

                    {/* Bouton */}
                    {isActive && expirationDate ? (
                      <div className="flex justify-center items-center bg-green-100 text-green-700 w-full py-4 rounded-2xl font-bold text-md transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95">
                        Expire le : {format(new Date(expirationDate), 'dd/MM/yyyy')}
                      </div>
                    ) : (
                      <button
                        disabled={loading || isForfaitActive}
                        onClick={() => handlePaymentModal(f)}
                        className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 ${isForfaitActive
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : isPopular
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-indigo-500/25'
                            : isPremium
                              ? 'bg-gradient-to-r from-[#FB9E3A] to-orange-500 text-white hover:from-orange-500 hover:to-amber-500 shadow-orange-500/25'
                              : 'bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:from-slate-700 hover:to-slate-800'
                          }`}
                      >
                        {loading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Chargement...
                          </div>
                        ) : (
                          'Choisir ce forfait'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="text-center mt-12 pt-8 border-t border-slate-200/50">
            <p className="text-slate-500 text-sm">
              🔒 <span className="font-semibold">Paiement sécurisé</span> •
              <span className="mx-2">💳</span> <span className="font-semibold">Toutes cartes acceptées</span> •
              <span className="mx-2">🔄</span> <span className="font-semibold">Résiliation à tout moment</span>
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Modal Paiement */}
      <AnimatePresence>
        {openPaymentModal && selectedForfait && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="bg-gradient-to-br from-white via-slate-50 to-gray-100 p-10 rounded-3xl shadow-2xl max-w-md w-full relative border border-gray-200"
            >
              <button
                onClick={() => setOpenPaymentModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-3xl font-bold transition-all duration-200"
              >
                ×
              </button>

              <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-4">
                Mode de Paiement
              </h2>
              <p className="text-gray-600 text-center mb-6">
                Sélectionnez votre méthode de paiement pour le forfait choisi.
              </p>

              {/* Forfait sélectionné */}
              <div className="bg-white p-5 rounded-2xl shadow-inner mb-6 text-center border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{selectedForfait.nom.toUpperCase()}</h3>
                <div className="text-3xl font-extrabold text-gray-900">
                  {selectedForfait.price} <span className="text-gray-500 text-lg font-semibold">€/mois</span>
                </div>
              </div>

              {/* Boutons de paiement */}
              <div className="flex flex-col gap-4">
                <button
                  disabled={loading}
                  
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold shadow-md transition-all duration-200 ${loading ? 'bg-gray-400 text-white cursor-wait' : 'bg-gray-500 text-white hover:bg-gray-700 hover:scale-105'}`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Chargement...
                    </div>
                  ) : (
                    <>
                      <FaCreditCard />
                      Payer avec Carte Bancaire
                    </>
                  )}
                </button>

                <button
                  disabled={loading}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold shadow-md transition-all duration-200 ${loading ? 'bg-gray-400 text-white cursor-wait' : 'bg-red-600 text-white hover:bg-red-700 hover:scale-105'}`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Chargement...
                    </div>
                  ) : (
                    <>
                      <FaCcStripe />
                      Payer avec Stripe
                    </>
                  )}
                </button>

                <button
                  disabled={loading}
                  onClick={() => onChoisir(selectedForfait.nom)}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold shadow-md transition-all duration-200 ${loading ? 'bg-gray-400 text-white cursor-wait' : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'}`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Chargement...
                    </div>
                  ) : (
                    <>
                      <FaCcPaypal />
                      Payer avec PayPal
                    </>
                  )}
                </button>
              </div>

              <p className="text-center text-gray-400 text-sm mt-6">
                🔒 Paiement sécurisé • Toutes cartes acceptées • Résiliation à tout moment
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};

export default ForfaitModal;