import React, { useState, useEffect } from "react";
import { Rocket, Star, Gem, Crown } from "lucide-react";
import PaymentPage from "../pages/paiment";
import { AuthModal } from "../components/Modal/authModal";
import { useStateContext } from "../context/ContextProvider";
import { getUserForfait } from "../services/forfaitService";

// Mapping des icônes
const iconMap = {
  STARTER: <Rocket className="w-10 h-10 text-blue-500" strokeWidth={2.5} />,
  PRO: <Star className="w-10 h-10 text-purple-500" strokeWidth={2.5} />,
  PREMIUM: <Gem className="w-10 h-10 text-pink-500" strokeWidth={2.5} />,
  GOLD: <Crown className="w-10 h-10 text-yellow-600" strokeWidth={2.5} />,
};

export default function NosForfaits() {
  const { token } = useStateContext();

  const [activeForfait, setActiveForfait] = useState(null);
  const [expirationDate, setExpirationDate] = useState(null);
  const [selectedForfait, setSelectedForfait] = useState(null);
  const [isOpenPaiement, setIsOpenPaiement] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);

  const forfaits = [
    { id: 1, nom: "STARTER", price: "$10", invitations: 10, events: 2, duration: "1 mois" },
    { id: 2, nom: "PRO", price: "$20", invitations: 50, events: 5, duration: "3 mois" },
    { id: 3, nom: "PREMIUM", price: "$50", invitations: 200, events: 20, duration: "6 mois" },
    { id: 4, nom: "GOLD", price: "$100", invitations: 500, events: 50, duration: "12 mois" },
  ];

  // 🔥 Récupération du forfait actif
  useEffect(() => {
    const fetchUserForfait = async () => {
      if (!token) return;
      try {
        const userForfait = await getUserForfait(token);
        console.log("userForfait:", userForfait);

        if (userForfait?.forfait) {
          setActiveForfait(userForfait.forfait);
          setExpirationDate(userForfait.forfaitExpirationDate);
        }
      } catch (err) {
        console.error("Erreur lors du chargement du forfait actif", err);
        alert("Impossible de charger votre forfait actif.");
      }
    };
    fetchUserForfait();
  }, [token]);

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
          Plans &{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FB9E3A] via-orange-500 to-amber-500">
            Tarifs
          </span>
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {forfaits.map((f) => {
          // ✅ Normalisation des noms pour éviter les problèmes de majuscules/minuscules
          const isActive =
            activeForfait && f.nom.toUpperCase() === activeForfait.nom.toUpperCase();
          const isDisabled = activeForfait && !isActive;

          return (
            <div
              key={f.id}
              className={`relative rounded-2xl shadow-lg p-8 border transition-transform ${
                isActive
                  ? "bg-gradient-to-br from-green-400 to-green-500 border-green-600 text-white scale-105"
                  : "bg-white border-gray-200 hover:-translate-y-2 hover:shadow-2xl"
              }`}
            >
              <div className="flex justify-center mb-4">{iconMap[f.nom]}</div>
              <h3 className="text-2xl font-extrabold mb-4">{f.nom}</h3>
              <p className={`text-3xl font-bold mb-6 ${isActive ? "text-white" : "text-gray-800"}`}>
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

              {token ? (
                isActive ? (
                  <button
                    type="button"
                    disabled
                    className="w-full py-3 px-5 rounded-xl font-semibold bg-white text-green-700 shadow cursor-default"
                  >
                    Expire le{" "}
                    {expirationDate
                      ? new Date(expirationDate).toLocaleDateString()
                      : "N/A"}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleAcheter(f)}
                    className={`w-full py-3 px-5 rounded-xl font-semibold transition-all duration-300 shadow focus:outline-none focus:ring ${
                      isDisabled
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90 focus:ring-blue-200"
                    }`}
                  >
                    Acheter ce forfait
                  </button>
                )
              ) : (
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="w-full py-3 px-5 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90 shadow"
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
        <AuthModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} isSignIn={true} />
      )}
    </section>
  );
}
