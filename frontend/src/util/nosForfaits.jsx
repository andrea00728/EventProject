import React, { useState, useEffect } from "react";
import { Rocket, Star, Gem, Crown, Info } from "lucide-react";
import PaymentPage from "../pages/paiment";
import { AuthModal } from "../components/Modal/authModal";
import { useStateContext } from "../context/ContextProvider";
import { getUserForfait, getAllForfait } from "../services/forfaitService";
import { Close, Event, MobileFriendly } from "@mui/icons-material";
import { Calendar } from "react-feather";
import ModalChangeForfait from "./modalChangeForfait";

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

// Fonction pour déterminer la durée basée sur validationduration
const getDurationText = (validationDuration) => {
  if (validationDuration === 30) return "1 mois";
  if (validationDuration === 180) return "6 mois";
  if (validationDuration === 365) return "12 mois";
  return `${Math.round((validationDuration || 0) / 30)} mois`;
};

// Fonction pour formatter le prix
const formatPrice = (price) => {
  return `€${price}`;
};

export default function NosForfaits() {
  const { isAuthenticated, user } = useStateContext();
  const [activeForfait, setActiveForfait] = useState(null);
  const [expirationDate, setExpirationDate] = useState(null);
  const [selectedForfait, setSelectedForfait] = useState(null);
  const [isOpenPaiement, setIsOpenPaiement] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDetailsOpen, setDetailsOpen] = useState(false);
  const [modalChangeForfait, setModalChangeForfait] = useState(false);
  const [forfaits, setForfaits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les forfaits depuis la base de données
  useEffect(() => {
    const fetchForfaits = async () => {
      try {
        setLoading(true);
        const forfaitsData = await getAllForfait();

        if (!forfaitsData || !Array.isArray(forfaitsData)) {
          throw new Error("Données de forfaits invalides");
        }

        // Map pour les événements en fonction du nom
        const eventsMap = { freemium: "1", starter: "2", pro: "5", premium: "20", gold: "50" };

        // Filtrer pour exclure FREEMIUM et transformer les données
        const transformedForfaits = forfaitsData
          .filter((forfait) => (forfait.nom || "").toLowerCase() !== "freemium")
          .map((forfait) => {
            const nameLower = (forfait.nom || "").toLowerCase();
            const events = eventsMap[nameLower] ?? "Illimité";

            return {
              id: forfait.id,
              nom: (forfait.nom || "").toUpperCase(),
              price: formatPrice(forfait.price),
              invitations: forfait.maxinvites ?? "Illimité",
              events, // ✅ corrigé: toujours défini
              duration: getDurationText(forfait.validationduration),
              paypalplanid: forfait.paypalplanid,
              rawPrice: forfait.price,
              maxEvents:
                forfait.maxevents ??
                (events !== "Illimité" ? Number(events) : null), // utile si tu veux un nombre
              maxInvites: forfait.maxinvites,
              validationDuration: forfait.validationduration,
            };
          });

        setForfaits(transformedForfaits);
        setError(null);
      } catch (err) {
        console.error("Erreur détaillée:", err);

        // Fallback sur des données statiques si l'API échoue
        console.warn("Utilisation des données de fallback");
        const fallbackForfaits = [
          { id: 12, nom: "STARTER", price: "€10", invitations: 100, events: "2", duration: "6 mois", rawPrice: 10, maxInvites: 100, validationDuration: 180 },
          { id: 13, nom: "PRO", price: "€25.99", invitations: 500, events: "5", duration: "6 mois", rawPrice: 25.99, maxInvites: 500, validationDuration: 180 },
          { id: 14, nom: "PREMIUM", price: "€39.99", invitations: 1000, events: "20", duration: "6 mois", rawPrice: 39.99, maxInvites: 1000, validationDuration: 180 },
          { id: 15, nom: "GOLD", price: "€59.99", invitations: "Illimité", events: "50", duration: "12 mois", rawPrice: 59.99, maxInvites: null, validationDuration: 365 },
        ];
        setForfaits(fallbackForfaits);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchForfaits();
  }, []);

  useEffect(() => {
    const fetchUserForfait = async () => {
      if (!isAuthenticated) return;
      if (user?.role === "organisateur") {
        try {
          const userForfait = await getUserForfait();
          if (userForfait?.forfait) {
            setActiveForfait(userForfait.forfait);
            setExpirationDate(userForfait.forfaitExpirationDate);
          }
        } catch (err) {
          console.error(err);
          console.log("Impossible de charger votre forfait actif.");
        }
      }
    };
    fetchUserForfait();
  }, [isAuthenticated, user]);

  const handleAcheter = (forfait) => {
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

  // État de chargement - affiche toujours 4 cartes
  if (loading) {
    return (
      <section className="container mx-auto py-16 px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">
            Plans &{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-pink-500">
              Tarifs
            </span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">Chargement des forfaits...</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white rounded-3xl shadow-lg p-8 border border-gray-200 animate-pulse">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
              </div>
              <div className="h-6 bg-gray-300 rounded mb-2"></div>
              <div className="h-8 bg-gray-300 rounded mb-4"></div>
              <div className="space-y-2 mb-6">
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded"></div>
              </div>
              <div className="h-12 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <section className="container mx-auto py-16 px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">
            Plans &{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-pink-500">
              Tarifs
            </span>
          </h2>
          <p className="text-red-500 max-w-xl mx-auto">{error}</p>
        </div>
      </section>
    );
  }

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

      {/* Cartes forfaits - toujours 4 cartes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {forfaits.map((f) => {
          const isActive =
            isAuthenticated && activeForfait && f.nom.toUpperCase() === activeForfait.nom.toUpperCase();
          const isDisabled =
            isAuthenticated && activeForfait && activeForfait.nom.toUpperCase() !== "FREEMIUM" && !isActive;

          return (
            <div
              key={f.id}
              className={`relative rounded-3xl shadow-lg p-8 border transition-transform transform hover:-translate-y-2 hover:shadow-2xl text ${
                isActive
                  ? `bg-gradient-to-br ${defaultColorMap[f.nom]} text-white scale-105 border-white`
                  : "bg-white border-gray-200 text-gray-800"
              }`}
            >
              <div className="flex justify-center mb-4">{iconMap[f.nom]}</div>
              <div className="text-center ">
                <h3 className="text-2xl font-extrabold mb-2">{f.nom}</h3>
                <p className={`text-3xl font-bold mb-4 ${isActive ? "text-white" : "text-gray-900"}`}>
                  {f.price}
                </p>
              </div>

              <ul className="text-sm space-y-2 mb-6">
                <li>
                  Invitations : <span className="font-semibold">{f.invitations}</span>
                </li>
                <li>
                  Événements : <span className="font-semibold">{f.events}</span>
                </li>
                <li>{f.nom === "STARTER" ? "Module personnel" : "Modules personnel et restauration"}</li>
              </ul>

              {isAuthenticated ? (
                isActive ? (
                  <div>
                    <button
                      disabled
                      className={`w-full py-3 rounded-xl font-semibold shadow cursor-default bg-white ${textColorMap[f.nom]} border-2 border-white transition-all`}
                    >
                      Expire le {expirationDate ? new Date(expirationDate).toLocaleDateString() : "N/A"}
                    </button>
                    <button
                      className="w-full py-3 rounded-xl font-semibold shadow cursor-pointer border-2 border-white transition-all mt-5 hover:bg-gray-400 hover:text-gray-800"
                      onClick={() => setModalChangeForfait(true)}
                    >
                      Changer de forfait
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2 sm:flex-row">
                    <button
                      onClick={() => handleVoirDetails(f)}
                      className={`absolute top-0 right-0 flex items-center justify-center w-12 h-12 rounded-full`}
                    >
                      <Info className="w-6 h-6 " />
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
                // Utilisateur déconnecté - affiche toujours les 4 cartes avec bouton Acheter
                <div className="flex gap-2 sm:flex-row">
                  <button
                    onClick={() => handleVoirDetails(f)}
                    className={`absolute top-0 right-0 flex items-center justify-center w-12 h-12 rounded-full`}
                  >
                    <Info className="w-6 h-6 " />
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

      {/* Modal détail forfait */}
      {isDetailsOpen && selectedForfait && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 relative overflow-y-auto max-h-[90vh] scrollbar-hide">
            <span className="absolute top-4 right-4" onClick={() => setDetailsOpen(false)}>
              <Close />
            </span>

            {/* Bandeau coloré en haut */}
            <div className={`absolute inset-x-0 top-0 h-2 rounded-t-3xl bg-gradient-to-r ${defaultColorMap[selectedForfait.nom]}`}></div>

            {/* Titre et prix */}
            <div className="text-center mb-6">
              <h3 className="text-3xl sm:text-4xl font-extrabold text-gray-900">{selectedForfait.nom}</h3>
              <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1">{selectedForfait.price}</p>
            </div>

            {/* Infos détaillées */}
            <ul className="space-y-4 text-gray-700 leading-relaxed">
              {/* Invitations */}
              <li className="flex items-start gap-3">
                <MobileFriendly className="text-blue-500 w-5 h-5 flex-shrink-0 mt-1" />
                <div>
                  <span className="font-semibold">Invitations :</span>{" "}
                  {selectedForfait.maxInvites
                    ? `Envoyez jusqu'à ${selectedForfait.maxInvites} invitations personnalisées à vos proches.`
                    : "Invitations illimitées incluses pour tous vos événements."}
                </div>
              </li>

              {/* Événements */}
              <li className="flex items-start gap-3">
                <Event className="text-purple-500 w-5 h-5 flex-shrink-0 mt-1" />
                <div>
                  <span className="font-semibold">Événements :</span>{" "}
                  {selectedForfait.events && selectedForfait.events !== "Illimité"
                    ? `Organisez jusqu'à ${selectedForfait.events} événements privés ou publics.`
                    : "Nombre d'événements illimité, sans restriction."}
                </div>
              </li>

              {/* Durée */}
              <li className="flex items-start gap-3">
                <Calendar className="text-pink-500 w-5 h-5 flex-shrink-0 mt-1" />
                <div>
                  <span className="font-semibold">Durée :</span>{" "}
                  Ce forfait est actif pendant <span className="font-semibold">{selectedForfait.duration}</span>, avec la possibilité de changer de forfait à tout moment selon vos besoins.
                </div>
              </li>

              {/* Avantages et fonctionnalités */}
              <li className="flex items-start gap-3">
                <Star className="text-yellow-500 w-5 h-5 flex-shrink-0 mt-1" />
                <div>
                  <span className="font-semibold">Fonctionnalités :</span>{" "}
                  {selectedForfait.nom === "STARTER"
                    ? "Vous avez accès aux fonctions de base avec le module personnel."
                    : "Vous avez toutes les fonctionnalités, incluant le module personnel et restauration."}
                </div>
              </li>

              {/* Idéal pour */}
              <li className="flex items-start gap-3">
                <Rocket className="text-green-500 w-5 h-5 flex-shrink-0 mt-1" />
                <div>
                  <span className="font-semibold">Idéal pour :</span>{" "}
                  {selectedForfait.nom === "STARTER" && "Petits événements privés ou débutants."}
                  {selectedForfait.nom === "PRO" && "Organisateurs réguliers d'événements de taille moyenne."}
                  {selectedForfait.nom === "PREMIUM" && "Événements professionnels et groupes étendus."}
                  {selectedForfait.nom === "GOLD" && "Entreprises ou organisateurs ambitieux cherchant toutes les fonctionnalités."}
                </div>
              </li>
            </ul>

            {/* Bouton fermer */}
            <button
              onClick={() => setDetailsOpen(false)}
              className="mt-6 w-full py-3 rounded-2xl font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90 transition-shadow shadow-lg"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* modal change forfait */}
      {modalChangeForfait && (
        <ModalChangeForfait
          isOpen={modalChangeForfait}
          onClose={() => setModalChangeForfait(false)}
          activeForfait={activeForfait}
        />
      )}

      {/* Paiement */}
      {isOpenPaiement && selectedForfait && (
        <PaymentPage forfait={selectedForfait} onClose={handleClosePayment} />
      )}

      {/* Auth modal */}
      {isModalOpen && <AuthModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} isSignIn={true} />}
    </section>
  );
}
