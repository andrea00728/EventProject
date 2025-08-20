import React, { useState } from "react";
import { Rocket, Star, Gem, Crown } from "lucide-react";
import PaymentPage from "../pages/paiment";
import { AuthModal } from "../components/Modal/authModal";
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import { useStateContext } from "../context/ContextProvider"; // ✅ Pour récupérer le token

const iconMap = {
  STARTER: <Rocket className="w-10 h-10 text-blue-500" strokeWidth={2.5} />,
  PRO: <Star className="w-10 h-10 text-purple-500" strokeWidth={2.5} />,
  PREMIUM: <Gem className="w-10 h-10 text-pink-500" strokeWidth={2.5} />,
  GOLD: <Crown className="w-10 h-10 text-yellow-600" strokeWidth={2.5} />,
};

export default function NosForfaits() {
  const { token } = useStateContext(); // ✅ Récupère si l’utilisateur est connecté
  const [forfaits] = useState([
    { id: 1, nom: "STARTER", price: "$10", invitations: 10, events: 2, duration: "1 mois" },
    { id: 2, nom: "PRO", price: "$20", invitations: 50, events: 5, duration: "3 mois" },
    { id: 3, nom: "PREMIUM", price: "$50", invitations: 200, events: 20, duration: "6 mois" },
    { id: 4, nom: "GOLD", price: "$100", invitations: 500, events: 50, duration: "12 mois" },
  ]);

  const [selectedForfait, setSelectedForfait] = useState(null);
  const [isOpenPaiement, setIsOpenPaiement] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);

  const handleAcheter = (forfait) => {
    setSelectedForfait(forfait);
    setIsOpenPaiement(true);
  };

  const handleClosePayment = () => {
    setIsOpenPaiement(false);
    setSelectedForfait(null);
  };

  return (
    <section className="container mx-auto py-24 px-4">
      <div className="text-center mb-16">
        <h2 className="text-4xl lg:text-5xl font-black text-slate-800 leading-tight tracking-tight mb-4">
          Plans &
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FB9E3A] via-orange-500 to-amber-500"> Tarifs</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {forfaits.map((f) => {
          const isGold = f.nom.toUpperCase() === "GOLD";
          return (
            <div
              key={f.id}
              className={`relative rounded-2xl shadow-lg p-8 border transition-transform hover:-translate-y-2 hover:shadow-2xl ${isGold
                ? "bg-gradient-to-br from-yellow-400 to-yellow-500 border-yellow-600 text-white"
                : "bg-white border-gray-200"
                }`}
            >
              {isGold && (
                <div className="absolute top-3 right-3 bg-white text-yellow-600 px-3 py-1 rounded-full text-xs font-bold shadow">
                  Populaire
                </div>
              )}

              <div className="flex justify-center mb-4">{iconMap[f.nom.toUpperCase()]}</div>
              <h3 className="text-2xl font-extrabold mb-4">{f.nom}</h3>
              <p
                className={`text-3xl font-bold mb-6 ${isGold ? "text-white" : "text-gray-800"
                  }`}
              >
                {f.price}
              </p>

              <ul className="text-sm space-y-2 mb-6">
                <li>
                  Invitations : <span className="font-semibold">{f.invitations}</span>
                </li>
                <li>
                  Événements : <span className="font-semibold">{f.events}</span>
                </li>
                <li>
                  Durée : <span className="font-semibold">{f.duration}</span>
                </li>
              </ul>

              {/* ✅ Deux boutons distincts */}
              {token ? (
                <button
                  type="button"
                  onClick={() => handleAcheter(f)}
                  className={`w-full py-3 px-5 rounded-xl font-semibold transition-all duration-300 shadow focus:outline-none focus:ring ${isGold
                    ? "bg-white text-yellow-600 hover:bg-gray-100 focus:ring-yellow-200"
                    : "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90 focus:ring-blue-200"
                    }`}
                >
                  Acheter ce forfait
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className={`w-full py-3 px-5 rounded-xl font-semibold transition-all duration-300 shadow focus:outline-none focus:ring ${isGold
                    ? "bg-white text-yellow-600 hover:bg-gray-100 focus:ring-yellow-200"
                    : "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90 focus:ring-blue-200"
                    }`}
                >
                  Acheter ce forfait
                </button>
              )}
            </div>
          );
        })}
      </div>

      {isOpenPaiement && selectedForfait && (
        <PaymentPage forfait={selectedForfait} onClose={handleClosePayment} />
      )}

      {isModalOpen && (
        <AuthModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          isSignIn={true}
        />
      )
      }
    </section>
  );
}
