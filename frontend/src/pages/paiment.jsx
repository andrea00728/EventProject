import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  Check,
  Star,
  Clock,
  Users,
  Gift,
  Zap,
  Crown,
  DollarSign,
  Smartphone,
  Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStateContext } from "../context/ContextProvider";
import { updateForfait } from "../services/forfaitService";
import { Event, MobileFriendly, Rocket } from "@mui/icons-material";

const plans = {
  freemium: {
    nom: "FREEMIUM",
    name: "Freemium",
    icon: Star,
    price: "0€",
    duration: "Illimité",
    maxInvites: 50,
    events: 1,
    features: ["Fonctionnalité basique 1", "Fonctionnalité basique 2"],
    buttonColor: "bg-gray-500 hover:bg-gray-600",
    bgColor: "bg-gray-100",
    iconBg: "bg-gray-200",
    textColor: "text-gray-800",
  },
  starter: {
    nom: "STARTER",
    name: "Starter",
    icon: Clock,
    price: "10€",
    duration: "1 mois",
    maxInvites: 200,
    events: 2,
    features: ["Toutes les fonctionnalités Freemium", "Support prioritaire"],
    buttonColor: "bg-blue-500 hover:bg-blue-600",
    bgColor: "bg-blue-100",
    iconBg: "bg-blue-200",
    textColor: "text-blue-800",
  },
  pro: {
    nom: "PRO",
    name: "Pro",
    icon: Users,
    price: "25.99€",
    duration: "1 mois",
    maxInvites: 500,
    events: 5,
    features: ["Toutes les fonctionnalités Starter", "Accès avancé", "Analyses détaillées"],
    buttonColor: "bg-green-500 hover:bg-green-600",
    bgColor: "bg-green-100",
    iconBg: "bg-green-200",
    textColor: "text-green-800",
  },
  premium: {
    nom: "PREMIUM",
    name: "Premium",
    icon: Gift,
    price: "39.99€",
    duration: "1 mois",
    maxInvites: 1000,
    events: 20,
    features: ["Toutes les fonctionnalités Pro", "Outils premium", "Personnalisation"],
    buttonColor: "bg-purple-500 hover:bg-purple-600",
    bgColor: "bg-purple-100",
    iconBg: "bg-purple-200",
    textColor: "text-purple-800",
  },
  gold: {
    nom: "GOLD",
    name: "Gold",
    icon: Crown,
    price: "59.99€",
    duration: "1 mois",
    maxInvites: "Illimité",
    events: 50,
    features: ["Toutes les fonctionnalités Premium", "Support VIP", "Fonctionnalités exclusives"],
    buttonColor: "bg-yellow-500 hover:bg-yellow-600",
    bgColor: "bg-yellow-100",
    iconBg: "bg-yellow-200",
    textColor: "text-yellow-800",
  },
};

const paymentMethods = [
  { id: "card", name: "Carte bancaire", icon: CreditCard },
  { id: "paypal", name: "PayPal", icon: DollarSign },
  { id: "mobile-money", name: "Mobile Money", icon: Smartphone },
  { id: "stripe", name: "Stripe", icon: Zap },
];

const PaymentPage = ({ forfait, onClose }) => {
  const { isAuthenticated } = useStateContext();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(
    forfait && forfait.nom ? forfait.nom.toLowerCase() : "pro"
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("card");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const selectedForfait = plans[selectedPlan];
  const PlanIcon = selectedForfait.icon;

  const handlePayment = useCallback(async () => {
    if (!isAuthenticated) {
      setError("Vous devez être connecté pour effectuer un paiement.");
      return;
    }

    if (selectedPlan === "freemium") {
      try {
        await updateForfait(selectedPlan);
        setError(null);
        alert("Plan Freemium activé avec succès !");
      } catch (err) {
        setError("Erreur lors de l'activation du plan Freemium.");
      }
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (selectedPaymentMethod === "paypal") {
        const res = await updateForfait(selectedPlan);
        if (res?.url && typeof res.url === "string" && res.url.startsWith("https://")) {
          window.location.href = res.url;
        } else {
          setError("URL de paiement PayPal non valide.");
        }
      } else {
        setError(`Paiement via ${selectedPaymentMethod} non implémenté pour le moment.`);
      }
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la tentative de paiement.");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, selectedPlan, selectedPaymentMethod]);

  if (!selectedForfait) {
    return (
      <div className="text-red-500 text-center p-4">
        Plan sélectionné non valide. Veuillez choisir un plan valide.
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white w-full h-full sm:max-w-5xl sm:h-[85vh] rounded-xl shadow-2xl p-6 sm:p-10 overflow-auto sm:relative fixed top-0 left-0 sm:top-auto sm:left-auto sm:m-auto"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="absolute top-5 right-5 text-gray-500 hover:text-gray-800 transition"
            onClick={onClose}
            aria-label="Fermer la fenêtre de paiement"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {error && (
            <div className="text-red-500 mb-4 p-3 bg-red-100 rounded">
              {error}
              {error.includes("PayPal") && (
                <button
                  className="ml-2 text-blue-600 underline"
                  onClick={handlePayment}
                >
                  Réessayer
                </button>
              )}
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">{selectedForfait.name}</h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className={`${selectedForfait.bgColor} rounded-2xl p-6 shadow-lg`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-xl ${selectedForfait.iconBg} shadow-inner`}>
                    <PlanIcon className={`w-8 h-8 ${selectedForfait.textColor}`} />
                  </div>
                  <div>
                    <span className={`text-3xl font-bold ${selectedForfait.textColor}`}>
                      {selectedForfait.price}
                    </span>
                  </div>
                </div>
                {/* <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-5 h-5" />
                  <span>{selectedPlan === "freemium" ? "Gratuit mais limité" : "Facturation mensuelle"}</span>
                </div> */}
              </div>

              {/* Section détaillée des fonctionnalités */}
              <ul className="space-y-4 text-gray-700 leading-relaxed">
                <li className="flex items-start gap-3">
                  <MobileFriendly className="text-blue-500 w-5 h-5 flex-shrink-0 mt-1"/>
                    <div>
                    <span className="font-semibold">Invitations :</span>{" "}
                    {selectedForfait.maxInvites
                      ? `Envoyez jusqu'à ${selectedForfait.maxInvites} invitations personnalisées à vos proches.`
                      : "Invitations illimitées incluses pour tous vos événements."}
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <Event className="text-purple-500 w-5 h-5 flex-shrink-0 mt-1" />
                  <div>
                    <span className="font-semibold">Événements :</span>{" "}
                    {selectedForfait.events && selectedForfait.events !== "Illimité"
                      ? `Organisez jusqu'à ${selectedForfait.events} événements privés ou publics.`
                      : "Nombre d'événements illimité, sans restriction."}
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <Calendar className="text-pink-500 w-5 h-5 flex-shrink-0 mt-1" />
                  <div>
                    <span className="font-semibold">Durée :</span>{" "}
                    Ce forfait est actif pendant <span className="font-semibold">{selectedForfait.duration}</span>, avec la possibilité de changer de forfait à tout moment selon vos besoins.
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <Star className="text-yellow-500 w-5 h-5 flex-shrink-0 mt-1" /> 
                  <div>
                    <span className="font-semibold">Fonctionnalités :</span>{" "}
                    {selectedForfait.nom === "STARTER"
                      ? "Vous avez accès aux fonctions de base avec le module personnel."
                      : "Vous avez toutes les fonctionnalités, incluant le module personnel et restauration."}
                  </div>
                </li>

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
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-6">
              <div>
                <h4 className="font-bold text-gray-900 mb-3">Méthode de paiement</h4>
                <div className="grid grid-cols-2 gap-4">
                  {paymentMethods.map((method) => {
                    const IconComp = method.icon;
                    const isSelected = selectedPaymentMethod === method.id;
                    return (
                      <div
                        key={method.id}
                        className={`border-2 rounded-xl p-4 flex flex-col items-center cursor-pointer transition-all duration-300 ${isSelected ? "border-blue-500 bg-blue-50 shadow-md" : "border-gray-200 hover:bg-gray-50"
                          }`}
                        onClick={() => setSelectedPaymentMethod(method.id)}
                      >
                        <IconComp className={`w-7 h-7 mb-2 ${isSelected ? "text-blue-600" : "text-gray-400"}`} />
                        <span className={`text-sm font-medium ${isSelected ? "text-blue-700" : "text-gray-500"}`}>
                          {method.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold text-white text-lg transition-transform duration-300 hover:scale-105 shadow-lg ${selectedForfait.buttonColor}`}
              >
                {loading ? "Chargement..." : selectedPlan === "freemium" ? "Commencer gratuitement" : "Confirmer l'abonnement"}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PaymentPage;