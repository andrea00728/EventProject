import React, { useState, useEffect } from "react";
import { Rocket, Star, Gem, Crown, Info, Loader } from "lucide-react";
import PaymentPage from "../pages/paiment";
import { AuthModal } from "../components/Modal/authModal";
import { useStateContext } from "../context/ContextProvider";
import { getUserForfait, getAllForfait } from "../services/forfaitService";
import { Close, Event, MobileFriendly } from "@mui/icons-material";
import { Calendar } from "react-feather";

const iconMap = {
  STARTER: <Rocket className="w-12 h-12 text-blue-500" strokeWidth={2.5} />,
  PRO: <Star className="w-12 h-12 text-purple-500" strokeWidth={2.5} />,
  PREMIUM: <Gem className="w-12 h-12 text-pink-500" strokeWidth={2.5} />,
  GOLD: <Crown className="w-12 h-12 text-yellow-600" strokeWidth={2.5} />,
  FREEMIUM: <Rocket className="w-12 h-12 text-gray-500" strokeWidth={2.5} />, // Ajout pour freemium
};

const defaultColorMap = {
  STARTER: "from-blue-400 to-blue-500",
  PRO: "from-purple-400 to-purple-500",
  PREMIUM: "from-pink-400 to-pink-500",
  GOLD: "from-yellow-400 to-yellow-500",
  FREEMIUM: "from-gray-400 to-gray-500",
};
//
const textColorMap = {
  STARTER: "text-blue-500",
  PRO: "text-purple-500",
  PREMIUM: "text-pink-500",
  GOLD: "text-yellow-500",
  FREEMIUM: "text-gray-500",
};

export default function NosForfaits() {
  const { isAuthenticated, user } = useStateContext();
  const [activeForfait, setActiveForfait] = useState(null);
  const [expirationDate, setExpirationDate] = useState(null);
  const [selectedForfait, setSelectedForfait] = useState(null);
  const [isOpenPaiement, setIsOpenPaiement] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDetailsOpen, setDetailsOpen] = useState(false);
  const [forfaits, setForfaits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fonction pour convertir la durée en jours vers un texte lisible
  const formatDuration = (days) => {
    if (days <= 0) return "Illimité";
    if (days <= 31) return `${days} jour${days > 1 ? 's' : ''}`;
    if (days <= 365) {
      const months = Math.round(days / 30);
      return `${months} mois`;
    }
    const years = Math.round(days / 365);
    return `${years} an${years > 1 ? 's' : ''}`;
  };

  // Fonction pour formater le prix
  const formatPrice = (price) => {
    if (price === 0) return "Gratuit";
    return `$${price}`;
  };

  useEffect(() => {
    const fetchForfaits = async () => {
      try {
        setLoading(true);
        const data = await getAllForfait();
        
        // Filtrer le forfait freemium s'il ne doit pas être affiché
        const visibleForfaits = data.filter(f => f.nom.toUpperCase() !== 'FREEMIUM');
        
        setForfaits(visibleForfaits);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des forfaits:', err);
        setError('Impossible de charger les forfaits');
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
          alert("Impossible de charger votre forfait actif.");
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

  if (loading) {
    return (
      <section className="container mx-auto py-16 px-4">
        <div className="flex justify-center items-center h-64">
          <Loader className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Chargement des forfaits...</span>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="container mx-auto py-16 px-4">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Réessayer
          </button>
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

      {/* Cartes forfaits */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {forfaits.map((f) => {
          const forfaitName = f.nom.toUpperCase();
          const isActive =
            activeForfait && forfaitName === activeForfait.nom.toUpperCase();
          const isDisabled =
            activeForfait &&
            activeForfait.nom.toUpperCase() !== "FREEMIUM" &&
            !isActive;

          return (
            <div
              key={f.id}
              className={`relative rounded-3xl shadow-lg p-8 border transition-transform transform hover:-translate-y-2 hover:shadow-2xl ${
                isActive
                  ? `bg-gradient-to-br ${defaultColorMap[forfaitName]} text-white scale-105 border-white`
                  : "bg-white border-gray-200 text-gray-800"
              }`}
            >
              <div className="flex justify-center mb-4">
                {iconMap[forfaitName] || <Star className="w-12 h-12 text-gray-500" strokeWidth={2.5} />}
              </div>
              <h3 className="text-2xl font-extrabold mb-2">{f.nom}</h3>
              <p className={`text-3xl font-bold mb-4 ${isActive ? "text-white" : "text-gray-900"}`}>
                {formatPrice(f.price)}
              </p>

              <ul className="text-sm space-y-2 mb-6">
                <li>
                  Invitations : 
                  <span className="font-semibold">
                    {f.maxinvites === null ? " Illimitées" : ` ${f.maxinvites}`}
                  </span>
                </li>
                <li>
                  Événements : 
                  <span className="font-semibold">
                    {f.maxevents === null ? " Illimités" : ` ${f.maxevents}`}
                  </span>
                </li>
                <li>
                  Durée : <span className="font-semibold">{formatDuration(f.validationduration)}</span>
                </li>
              </ul>

              {isAuthenticated ? (
                isActive ? (
                  <button
                    disabled
                    className={`w-full py-3 rounded-xl font-semibold shadow cursor-default bg-white ${textColorMap[forfaitName]} border-2 border-white transition-all`}
                  >
                    Expire le {expirationDate ? new Date(expirationDate).toLocaleDateString() : "N/A"}
                  </button>
                ) : (
                  <div className="flex gap-2 sm:flex-row">
                    <button
                      onClick={() => handleVoirDetails(f)}
                      className={`absolute top-4 right-4 flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/10 transition-colors`}
                    >
                      <Info className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleAcheter(f)}
                      disabled={isDisabled}
                      className={`w-full py-3 rounded-xl font-semibold shadow transition-all duration-300 focus:outline-none focus:ring ${
                        isDisabled
                          ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                          : `bg-gradient-to-r ${defaultColorMap[forfaitName]} text-white hover:opacity-90`
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
                    className={`absolute top-4 right-4 flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/10 transition-colors`}
                  >
                    <Info className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setModalOpen(true)}
                    className={`flex-1 py-3 rounded-xl font-semibold text-white shadow bg-gradient-to-r ${defaultColorMap[forfaitName]} hover:opacity-90 transition`}
                  >
                    Acheter
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal détails forfait */}
      {isDetailsOpen && selectedForfait && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 relative overflow-y-auto max-h-[90vh] scrollbar-hide">
            <span 
              className="absolute top-4 right-4 cursor-pointer hover:bg-gray-100 rounded-full p-1 transition-colors" 
              onClick={() => setDetailsOpen(false)}
            >
              <Close />
            </span>

            {/* Bandeau coloré en haut */}
            <div
              className={`absolute inset-x-0 top-0 h-2 rounded-t-3xl bg-gradient-to-r ${defaultColorMap[selectedForfait.nom.toUpperCase()]}`}
            ></div>

            {/* Titre et prix */}
            <div className="text-center mb-6 mt-4">
              <h3 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                {selectedForfait.nom}
              </h3>
              <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1">
                {formatPrice(selectedForfait.price)}
              </p>
            </div>

            {/* Infos détaillées */}
            <ul className="space-y-4 text-gray-700 leading-relaxed">
              {/* Invitations */}
              <li className="flex items-start gap-3">
                <MobileFriendly className="text-blue-500 w-5 h-5 flex-shrink-0 mt-1" />
                <div>
                  <span className="font-semibold">Invitations :</span>{" "}
                  {selectedForfait.maxinvites === null
                    ? "Invitations illimitées pour tous vos événements."
                    : `Envoyez jusqu'à ${selectedForfait.maxinvites} invitations personnalisées à vos proches.`}
                </div>
              </li>

              {/* Événements */}
              <li className="flex items-start gap-3">
                <Event className="text-purple-500 w-5 h-5 flex-shrink-0 mt-1" />
                <div>
                  <span className="font-semibold">Événements :</span>{" "}
                  {selectedForfait.maxevents === null
                    ? "Nombre d'événements illimité, sans restriction."
                    : `Organisez jusqu'à ${selectedForfait.maxevents} événements privés ou publics.`}
                </div>
              </li>

              {/* Durée */}
              <li className="flex items-start gap-3">
                <Calendar className="text-pink-500 w-5 h-5 flex-shrink-0 mt-1" />
                <div>
                  <span className="font-semibold">Durée :</span>{" "}
                  Ce forfait est actif pendant{" "}
                  <span className="font-semibold">{formatDuration(selectedForfait.validationduration)}</span>
                  {selectedForfait.validationduration > 0 && 
                    ", avec la possibilité de changer de forfait à tout moment selon vos besoins."
                  }
                </div>
              </li>

              {/* Fonctionnalités selon le type de forfait */}
              <li className="flex items-start gap-3">
                <Star className="text-yellow-500 w-5 h-5 flex-shrink-0 mt-1" />
                <div>
                  <span className="font-semibold">Fonctionnalités :</span>{" "}
                  {selectedForfait.nom.toUpperCase() === "STARTER" &&
                    "Module personnel pour vos événements privés."}
                  {(selectedForfait.nom.toUpperCase() === "PRO" ||
                    selectedForfait.nom.toUpperCase() === "PREMIUM" ||
                    selectedForfait.nom.toUpperCase() === "GOLD") &&
                    "Accès complet : modules personnel et restauration pour une gestion complète de vos événements."}
                  {selectedForfait.nom.toUpperCase() === "FREEMIUM" &&
                    "Fonctionnalités de base pour découvrir notre plateforme."}
                </div>
              </li>

              {/* Idéal pour */}
              <li className="flex items-start gap-3">
                <Rocket className="text-green-500 w-5 h-5 flex-shrink-0 mt-1" />
                <div>
                  <span className="font-semibold">Idéal pour :</span>{" "}
                  {selectedForfait.nom.toUpperCase() === "STARTER" && "Petits événements privés ou débutants."}
                  {selectedForfait.nom.toUpperCase() === "PRO" && "Organisateurs réguliers d'événements de taille moyenne."}
                  {selectedForfait.nom.toUpperCase() === "PREMIUM" && "Événements professionnels et groupes étendus."}
                  {selectedForfait.nom.toUpperCase() === "GOLD" && "Entreprises ou organisateurs ambitieux cherchant toutes les fonctionnalités."}
                  {selectedForfait.nom.toUpperCase() === "FREEMIUM" && "Utilisateurs souhaitant tester la plateforme."}
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

      {/* Paiement */}
      {isOpenPaiement && selectedForfait && (
        <PaymentPage forfait={selectedForfait} onClose={handleClosePayment} />
      )}

      {/* Auth modal */}
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