import React, { useState, useEffect } from "react";
import { Rocket, Star, Gem, Crown, Info } from "lucide-react";
import { Close, Event, MobileFriendly } from "@mui/icons-material";
import { Calendar } from "react-feather";
import PaymentPage from "../pages/paiment";
import { getAllForfait } from "../services/forfaitService";

const iconMap = {
  STARTER: <Rocket className="w-8 h-8 text-blue-500" strokeWidth={2.5} />,
  PRO: <Star className="w-8 h-8 text-purple-500" strokeWidth={2.5} />,
  PREMIUM: <Gem className="w-8 h-8 text-pink-500" strokeWidth={2.5} />,
  GOLD: <Crown className="w-8 h-8 text-yellow-600" strokeWidth={2.5} />,
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
  return `${Math.round(validationDuration / 30)} mois`;
};

// Fonction pour formatter le prix
const formatPrice = (price) => {
  return `£${price}`;
};

export default function ModalChangeForfait({ isOpen, onClose, activeForfait }) {
  const [selectedForfait, setSelectedForfait] = useState(null);
  const [isOpenPaiement, setIsOpenPaiement] = useState(false);
  const [isDetailsOpen, setDetailsOpen] = useState(false);
  const [forfaits, setForfaits] = useState([]);
  const [loading, setLoading] = useState(true);

  // Charger les forfaits depuis la base de données
  useEffect(() => {
    const fetchForfaits = async () => {
      if (!isOpen) return;
      
      try {
        setLoading(true);
        const forfaitsData = await getAllForfait();
        
        // Vérifier si les données sont valides
        if (!forfaitsData || !Array.isArray(forfaitsData)) {
          throw new Error("Données de forfaits invalides");
        }
        
        // Filtrer pour exclure FREEMIUM et transformer les données
        const transformedForfaits = forfaitsData
          .filter(forfait => forfait.nom.toLowerCase() !== 'freemium')
          .map(forfait => ({
            id: forfait.id,
            nom: forfait.nom.toUpperCase(),
            price: formatPrice(forfait.price),
            invitations: forfait.maxinvites || "Illimité",
            events: forfait.nom == "freemium" ? "1" : "" || forfait.nom == "starter" ? "2" : "" || forfait.nom == "pro" ? "5" : "" || forfait.nom == "premium" ? "20" : "" || forfait.nom == "gold" ? "50" : "",
            duration: getDurationText(forfait.validationduration),
            paypalplanid: forfait.paypalplanid,
            rawPrice: forfait.price,
            maxEvents: forfait.maxevents,
            maxInvites: forfait.maxinvites,
            validationDuration: forfait.validationduration
          }));

        setForfaits(transformedForfaits);
      } catch (err) {
        console.error("Erreur détaillée:", err);
        
        // Fallback sur des données statiques si l'API échoue
        console.warn("Utilisation des données de fallback pour ModalChangeForfait");
        const fallbackForfaits = [
          { id: 12, nom: "STARTER", price: "$10", invitations: 100, events: "2", duration: "6 mois", rawPrice: 10, maxInvites: 100, validationDuration: 180 },
          { id: 13, nom: "PRO", price: "$25.99", invitations: 500, events: "5", duration: "6 mois", rawPrice: 25.99, maxInvites: 500, validationDuration: 180 },
          { id: 14, nom: "PREMIUM", price: "$39.99", invitations: 1000, events: "20", duration: "6 mois", rawPrice: 39.99, maxInvites: 1000, validationDuration: 180 },
          { id: 15, nom: "GOLD", price: "$59.99", invitations: "Illimité", events: "50", duration: "12 mois", rawPrice: 59.99, maxInvites: null, validationDuration: 365 },
        ];
        setForfaits(fallbackForfaits);
      } finally {
        setLoading(false);
      }
    };

    fetchForfaits();
  }, [isOpen]);

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

  if (!isOpen) return null;

  return (
    <>
      {/* Modal principale */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide">
          {/* Header */}
          <div className="sticky top-0 bg-white rounded-t-3xl border-b border-gray-200 px-6 py-4 flex justify-between items-center z-50">
            <h2 className="text-2xl font-bold text-gray-900">
              Changer de forfait
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Close className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Contenu */}
          <div className="p-6">
            {activeForfait && (
              <div className="mb-6 p-4 bg-blue-50 rounded-2xl border border-blue-200">
                <p className="text-sm text-blue-700">
                  <span className="font-semibold">Forfait actuel :</span> {activeForfait.nom}
                </p>
              </div>
            )}

            {/* État de chargement */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="bg-white rounded-2xl shadow-md p-6 border border-gray-200 animate-pulse">
                    <div className="flex justify-center mb-3">
                      <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                    </div>
                    <div className="h-5 bg-gray-300 rounded mb-2"></div>
                    <div className="h-6 bg-gray-300 rounded mb-4"></div>
                    <div className="space-y-2 mb-4">
                      <div className="h-3 bg-gray-300 rounded"></div>
                      <div className="h-3 bg-gray-300 rounded"></div>
                      <div className="h-3 bg-gray-300 rounded"></div>
                    </div>
                    <div className="h-8 bg-gray-300 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              /* Grille des forfaits */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {forfaits.map((f) => {
                  const isActive =
                    activeForfait && f.nom.toUpperCase() === activeForfait.nom.toUpperCase();

                  return (
                    <div
                      key={f.id}
                      className={`relative rounded-2xl shadow-md p-6 border transition-transform transform hover:-translate-y-1 hover:shadow-lg ${isActive
                        ? `bg-gradient-to-br ${defaultColorMap[f.nom]} text-white border-white`
                        : "bg-white border-gray-200 text-gray-800"
                      }`}
                    >
                      <div className="flex justify-center mb-3">{iconMap[f.nom]}</div>
                      <h3 className="text-xl font-bold mb-2 text-center">{f.nom}</h3>
                      <p className={`text-2xl font-bold mb-4 text-center ${isActive ? "text-white" : "text-gray-900"}`}>
                        {f.price}
                      </p>

                      <ul className="text-xs space-y-2 mb-4">
                        <li>Invitations : <span className="font-semibold">{f.invitations}</span></li>
                        <li>Événements : <span className="font-semibold">{f.events}</span></li>
                        <li className="text-xs">
                          {f.nom === "STARTER" ? "Module personnel" : "Modules personnel et restauration"}
                        </li>
                      </ul>

                      {isActive ? (
                        <button
                          disabled
                          className={`w-full py-2 text-sm rounded-xl font-semibold shadow cursor-default bg-white ${textColorMap[f.nom]} border-2 border-white transition-all`}
                        >
                          Forfait actuel
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleVoirDetails(f)}
                            className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition-colors"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleAcheter(f)}
                            className={`flex-1 py-2 text-sm rounded-xl font-semibold shadow transition-all duration-300 focus:outline-none focus:ring bg-gradient-to-r ${defaultColorMap[f.nom]} text-white hover:opacity-90`}
                          >
                            Changer
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal détails forfait */}
      {isDetailsOpen && selectedForfait && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-60 px-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 relative overflow-y-auto max-h-[90vh] scrollbar-hide">
            <span 
              className="absolute top-4 right-4 cursor-pointer hover:bg-gray-100 rounded-full p-1 transition-colors" 
              onClick={() => setDetailsOpen(false)}
            >
              <Close />
            </span>

            {/* Bandeau coloré en haut */}
            <div
              className={`absolute inset-x-0 top-0 h-2 rounded-t-3xl bg-gradient-to-r ${defaultColorMap[selectedForfait.nom]}`}
            ></div>

            {/* Titre et prix */}
            <div className="text-center mb-6">
              <h3 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                {selectedForfait.nom}
              </h3>
              <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1">
                {selectedForfait.price}
              </p>
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
                  {selectedForfait.maxEvents
                    ? `Organisez jusqu'à ${selectedForfait.maxEvents} événements privés ou publics.`
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
                  {selectedForfait.nom === "STARTER" &&
                    "Vous avez accès aux fonctions de base avec le module personnel."}
                  {(selectedForfait.nom === "PRO" ||
                    selectedForfait.nom === "PREMIUM" ||
                    selectedForfait.nom === "GOLD") &&
                    "Vous avez toutes les fonctionnalités, incluant le module personnel et restauration."}
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

      {/* Modal de paiement */}
      {isOpenPaiement && selectedForfait && (
        <PaymentPage forfait={selectedForfait} onClose={handleClosePayment} />
      )}
    </>
  );
}