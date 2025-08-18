import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthModal } from "../components/Modal/authModal";

export default function NosForfaits() {
  const [showModal, setShowModal] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [selectedForfait, setSelectedForfait] = useState(null);

  // Composant Carte
  const Card = ({ title, price, invitations, events, duration }) => {
    return (
      <motion.div
        whileHover={{ scale: 1.03 }}
        transition={{ duration: 0.3 }}
        onClick={() => {
          setSelectedForfait(title);
          setShowModal(true);
        }}
        className="relative rounded-xl shadow-lg p-6 border group cursor-pointer bg-white border-gray-200 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-200"
      >
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        <p className="text-2xl font-extrabold mb-2">{price}</p>
        <p>Invitations : {invitations}</p>
        <p>Événements : {events}</p>
        <p>Durée : {duration}</p>

        {/* Overlay au survol */}
        <div className="absolute inset-0 bg-white/90 rounded-xl p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-center shadow-lg">
          <h4 className="text-xl font-bold mb-2">{title} Details</h4>
          <p className="text-sm mb-1">Profitez pleinement de ce forfait pour organiser vos événements.</p>
          <p className="text-sm mb-1">Support prioritaire et accès à toutes les fonctionnalités.</p>
          <p className="text-sm">Annulation possible à tout moment.</p>
        </div>
      </motion.div>
    );
  };

  return (
    <>
      <section className="relative bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 py-24 px-4 rounded-3xl shadow-2xl overflow-hidden">
        {/* Orbes lumineux */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-[#FB9E3A]/10 to-orange-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-gradient-to-l from-indigo-400/15 to-purple-400/10 rounded-full blur-2xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-violet-300/5 to-fuchsia-300/5 rounded-full blur-3xl" />

        <div className="container mx-auto text-center max-w-7xl relative z-10">
          <h2 className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent text-5xl sm:text-6xl font-extrabold mb-6 animate-fadeIn tracking-tight">
            NOS FORFAITS
          </h2>

          <p className="text-gray-700 text-xl sm:text-2xl font-light leading-relaxed max-w-3xl mx-auto mb-12 animate-fadeIn">
            Choisissez le forfait qui correspond le mieux à vos besoins.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 animate-fadeIn">
            <Card title="STARTER" price="10 €/mois" invitations="100" events="5" duration="91 jours" />
            <Card title="PRO" price="25.99 €/mois" invitations="500" events="10" duration="182 jours" />
            <Card title="PREMIUM" price="39.99 €/mois" invitations="1000" events="15" duration="273 jours" />
            <Card title="GOLD" price="59.99 €/mois" invitations="Illimité" events="20" duration="370 jours" />
          </div>

          <p className="mt-12 text-center text-gray-500 text-sm animate-fadeIn">
            🔒 Paiement sécurisé • 💳 Toutes cartes acceptées • 🔄 Résiliation à tout moment
          </p>
        </div>
      </section>

      {/* Modal Confirmation */}
      <AnimatePresence>
        {showModal && !showLogin && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl shadow-xl p-6 w-96"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-lg font-semibold mb-4">
                Voulez-vous acheter le forfait <span className="font-bold">{selectedForfait}</span> ?
              </h2>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    setShowLogin(true);
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  Oui
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nouveau formulaire AuthModal */}
      <AuthModal
        isOpen={showLogin}
        onClose={() => {
          setShowLogin(false);
          setShowModal(false);
        }}
      />

      {/* Animation fadeIn */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.8s ease-out forwards; }
      `}</style>
    </>
  );
}
