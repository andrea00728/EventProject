import React, { useState, useEffect } from "react";
import { Rocket, Star, Gem, Crown, Info } from "lucide-react";
import PaymentPage from "../pages/paiment";
import { AuthModal } from "../components/Modal/authModal";
import { useStateContext } from "../context/ContextProvider";
import { getUserForfait } from "../services/forfaitService";
import { Close, Event, MobileFriendly } from "@mui/icons-material";
import { Calendar } from "react-feather";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { getConditionalSubMenus } from "./menuUtils"; 

const iconMap = {
  STARTER: <Rocket className="w-12 h-12 text-blue-500" strokeWidth={2.5} />,
  PRO: <Star className="w-12 h-12 text-purple-500" strokeWidth={2.5} />,
  PREMIUM: <Gem className="w-12 h-12 text-pink-500" strokeWidth={2.5} />,
  GOLD: <Crown className="w-12 h-12 text-yellow-600" strokeWidth={2.5} />,
};

const defaultColorMap = {
  STARTER: "from-blue-400 to-blue-500",
  PRO: "from-purple-400 to-purple-500",
  PREMIUM: "from-pink-400 to-pink-500",
  GOLD: "from-yellow-400 to-yellow-500",
};

const textColorMap = {
  STARTER: "text-blue-500",
  PRO: "text-purple-500",
  PREMIUM: "text-pink-500",
  GOLD: "text-yellow-500",
};

export default function NosForfaits() {
  const { isAuthenticated } = useStateContext();
  const [activeForfait, setActiveForfait] = useState(null);
  const [expirationDate, setExpirationDate] = useState(null);
  const [selectedForfait, setSelectedForfait] = useState(null);
  const [isOpenPaiement, setIsOpenPaiement] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDetailsOpen, setDetailsOpen] = useState(false);
  const navigate = useNavigate();

  const forfaits = [
    { id: 1, nom: "STARTER", price: "$10", invitations: 10, events: 2, duration: "1 mois" },
    { id: 2, nom: "PRO", price: "$20", invitations: 50, events: 5, duration: "3 mois" },
    { id: 3, nom: "PREMIUM", price: "$50", invitations: 200, events: 20, duration: "6 mois" },
    { id: 4, nom: "GOLD", price: "$100", invitations: 500, events: 50, duration: "12 mois" },
  ];

  useEffect(() => {
    const fetchUserForfait = async () => {
      if (!isAuthenticated) return;
      try {
        const userForfait = await getUserForfait();
        if (userForfait?.forfait) {
          setActiveForfait(userForfait.forfait);
          setExpirationDate(userForfait.forfaitExpirationDate);

          // ⚡ Utilisation des sous-menus corrigée
          const subMenus = getConditionalSubMenus(userForfait.forfait.nom);
          console.log("Sous-menus disponibles :", subMenus);
        }
      } catch (err) {
        console.error("Erreur dans fetchUserForfait :", err);
        if (err.response?.status === 401) {
          toast.error("Veuillez vous reconnecter pour accéder à votre forfait.");
          navigate("/login");
        } else {
          toast.error("Impossible de charger votre forfait actif.");
        }
      }
    };
    fetchUserForfait();
  }, [isAuthenticated, navigate]);

  const handleAcheter = (forfait) => {
    if (!isAuthenticated) {
      setModalOpen(true);
      return;
    }
    setSelectedForfait(forfait);
    setIsOpenPaiement(true);
  };

  const handleClosePayment = () => {
    setIsOpenPaiement(false);
    setSelectedForfait(null);
  };

  const handleVoirDetails = (forfait) => {
    setSelectedForfait(forfait);
    setDetailsOpen(true);
  };

  return (
    <section className="container mx-auto py-16 px-4">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">
          Plans &{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-pink-500">
            Tarifs
          </span>
        </h2>
        <p className="text-gray-500 max-w-xl mx-auto">
          Choisissez le forfait qui correspond le mieux à vos besoins et profitez de fonctionnalités exclusives.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {forfaits.map((f) => {
          const isActive =
            activeForfait && f.nom.toUpperCase() === activeForfait.nom.toUpperCase();
          const isDisabled =
            activeForfait &&
            activeForfait.nom.toUpperCase() !== "FREEMIUM" &&
            !isActive;

          return (
            <div
              key={f.id}
              className={`relative rounded-3xl shadow-lg p-8 border transition-transform transform hover:-translate-y-2 hover:shadow-2xl ${
                isActive
                  ? `bg-gradient-to-br ${defaultColorMap[f.nom]} text-white scale-105 border-white`
                  : "bg-white border-gray-200 text-gray-800"
              }`}
            >
              <div className="flex justify-center mb-4">{iconMap[f.nom]}</div>
              <h3 className="text-2xl font-extrabold mb-2">{f.nom}</h3>
              <p className={`text-3xl font-bold mb-4 ${isActive ? "text-white" : "text-gray-900"}`}>
                {f.price}
              </p>

              <ul className="text-sm space-y-2 mb-6">
                <li>Invitations : <span className="font-semibold">{f.invitations}</span></li>
                <li>Événements : <span className="font-semibold">{f.events}</span></li>
                <li>Durée : <span className="font-semibold">{f.duration}</span></li>
              </ul>

              {isAuthenticated ? (
                isActive ? (
                  <button
                    disabled
                    className={`w-full py-3 rounded-xl font-semibold shadow cursor-default bg-white ${textColorMap[f.nom]} border-2 border-white transition-all`}
                  >
                    Expire le {expirationDate ? new Date(expirationDate).toLocaleDateString() : "N/A"}
                  </button>
                ) : (
                  <div className="flex gap-2 sm:flex-row">
                    <button
                      onClick={() => handleVoirDetails(f)}
                      className="absolute top-0 right-0 flex items-center justify-center w-12 h-12 rounded-full"
                    >
                      <Info className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => handleAcheter(f)}
                      disabled={isDisabled}
                      className={`w-full py-3 rounded-xl font-semibold shadow transition-all duration-300 focus:outline-none focus:ring ${
                        isDisabled
                          ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                          : `bg-gradient-to-r ${defaultColorMap[f.nom]} text-white hover:opacity-90`
                      }`}
                    >
                      Acheter
                    </button>
                  </div>
                )
              ) : (
                <div className="flex gap-2 sm:flex-row">
                  <button
                    onClick={() => handleVoirDetails(f)}
                    className="absolute top-0 right-0 flex items-center justify-center w-12 h-12 rounded-full"
                  >
                    <Info className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setModalOpen(true)}
                    className={`flex-1 py-3 rounded-xl font-semibold text-white shadow bg-gradient-to-r ${defaultColorMap[f.nom]} hover:opacity-90 transition`}
                  >
                    Acheter
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isDetailsOpen && selectedForfait && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 relative overflow-y-auto max-h-[90vh] scrollbar-hide">
            <span className="absolute top-4 right-4 cursor-pointer" onClick={() => setDetailsOpen(false)}>
              <Close />
            </span>
            <div
              className={`absolute inset-x-0 top-0 h-2 rounded-t-3xl bg-gradient-to-r ${defaultColorMap[selectedForfait.nom]}`}
            ></div>
            <div className="text-center mb-6">
              <h3 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                {selectedForfait.nom}
              </h3>
              <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1">
                {selectedForfait.price}
              </p>
            </div>
            <ul className="space-y-4 text-gray-700 leading-relaxed">
              <li className="flex items-start gap-3">
                <MobileFriendly className="text-blue-500 w-5 h-5 flex-shrink-0 mt-1" />
                <div>
                  <span className="font-semibold">Invitations :</span>{" "}
                  {selectedForfait.invitations > 0
                    ? `Envoyez jusqu’à ${selectedForfait.invitations} invitations personnalisées à vos proches.`
                    : "Invitations illimitées incluses pour tous vos événements."}
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Event className="text-purple-500 w-5 h-5 flex-shrink-0 mt-1" />
                <div>
                  <span className="font-semibold">Événements :</span>{" "}
                  {selectedForfait.events > 0
                    ? `Organisez jusqu’à ${selectedForfait.events} événements privés ou publics.`
                    : "Nombre d’événements illimité, sans restriction."}
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Calendar className="text-pink-500 w-5 h-5 flex-shrink-0 mt-1" />
                <div>
                  <span className="font-semibold">Durée :</span>{" "}
                  Profitez de ce forfait pendant <span className="font-semibold">{selectedForfait.duration}</span>, avec accès complet à toutes les fonctionnalités.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Star className="text-yellow-500 w-5 h-5 flex-shrink-0 mt-1" />
                <div>
                  <span className="font-semibold">Avantages exclusifs :</span>{" "}
                  Accédez à des fonctionnalités premium : gestion avancée des invités, rapports détaillés et support prioritaire.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Rocket className="text-green-500 w-5 h-5 flex-shrink-0 mt-1" />
                <div>
                  <span className="font-semibold">Idéal pour :</span>{" "}
                  {selectedForfait.nom === "STARTER" && "Petits événements privés ou débutants."}
                  {selectedForfait.nom === "PRO" && "Organisateurs réguliers d’événements de taille moyenne."}
                  {selectedForfait.nom === "PREMIUM" && "Événements professionnels et groupes étendus."}
                  {selectedForfait.nom === "GOLD" && "Entreprises ou organisateurs ambitieux cherchant toutes les fonctionnalités."}
                </div>
              </li>
            </ul>
            <button
              onClick={() => setDetailsOpen(false)}
              className="mt-6 w-full py-3 rounded-2xl font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90 transition-shadow shadow-lg"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {isOpenPaiement && selectedForfait && (
        <PaymentPage forfait={selectedForfait} onClose={handleClosePayment} />
      )}

      {isModalOpen && (
        <AuthModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          isSignIn={true}
        />
      )}
    </section>
  );
}