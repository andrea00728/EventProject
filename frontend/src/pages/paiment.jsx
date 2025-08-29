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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStateContext } from "../context/ContextProvider";
import { updateForfait } from "../services/forfaitService";

const plans = {
  freemium: {
    name: "Freemium",
    icon: Star,
    price: "0€",
    duration: "/mois",
    features: ["Fonctionnalité basique 1", "Fonctionnalité basique 2"],
    buttonColor: "bg-gray-500 hover:bg-gray-600",
    bgColor: "bg-gray-100",
    iconBg: "bg-gray-200",
    textColor: "text-gray-800",
  },
  starter: {
    name: "Starter",
    icon: Clock,
    price: "9.99€",
    duration: "/mois",
    features: ["Toutes les fonctionnalités Freemium", "Support prioritaire"],
    buttonColor: "bg-blue-500 hover:bg-blue-600",
    bgColor: "bg-blue-100",
    iconBg: "bg-blue-200",
    textColor: "text-blue-800",
  },
  pro: {
    name: "Pro",
    icon: Users,
    price: "19.99€",
    duration: "/mois",
    features: ["Toutes les fonctionnalités Starter", "Accès avancé", "Analyses détaillées"],
    buttonColor: "bg-green-500 hover:bg-green-600",
    bgColor: "bg-green-100",
    iconBg: "bg-green-200",
    textColor: "text-green-800",
  },
  premium: {
    name: "Premium",
    icon: Gift,
    price: "29.99€",
    duration: "/mois",
    features: ["Toutes les fonctionnalités Pro", "Outils premium", "Personnalisation"],
    buttonColor: "bg-purple-500 hover:bg-purple-600",
    bgColor: "bg-purple-100",
    iconBg: "bg-purple-200",
    textColor: "text-purple-800",
  },
  gold: {
    name: "Gold",
    icon: Crown,
    price: "49.99€",
    duration: "/mois",
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

  const selectedPlanDetails = plans[selectedPlan];
  
  // Dans PaymentPage ou le composant qui gère l'achat
const initiatePayment = async () => {
  try {
    // Récupérer le token JWT actuel
    const token = getCookie('jwt'); // Fonction pour récupérer le cookie
    
    const response = await axiosClient.post('/forfait/upgrade', {
      forfaitNom: forfait.nom,
      token: token // Envoyer le token avec la requête
    }, {
      withCredentials: true
    });

    // Rediriger vers PayPal
    window.location.href = response.data.url;
  } catch (error) {
    toast.error('Erreur lors du démarrage du paiement');
  }
};
  
// Fonction utilitaire pour récupérer les cookies
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

  const handlePayment = useCallback(async () => {
    if (!isAuthenticated) {
      setError("Vous devez être connecté pour effectuer un paiement.");
      return;
    }

    if (selectedPlan === "freemium") {
      try {
        await updateForfait( selectedPlan);
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
        const res = await updateForfait( selectedPlan);
        console.log("URL PayPal:", res?.url || "Aucune URL");

        if (res?.url && typeof res.url === "string" && res.url.startsWith("https://")) {
          // Redirection dans le même onglet
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


  if (!selectedPlanDetails) {
    return (
      <div className="text-red-500 text-center p-4">
        Plan sélectionné non valide. Veuillez choisir un plan valide.
      </div>
    );
  }

  const PlanIcon = selectedPlanDetails.icon;

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
  className="bg-white w-full h-full sm:max-w-5xl sm:h-[85vh] rounded-xl shadow-2xl p-6 sm:p-10 
             overflow-auto sm:relative fixed top-0 left-0 sm:top-auto sm:left-auto sm:m-auto"
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
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">{selectedPlanDetails.name}</h2>
          </div>

          {/* <div className="flex flex-wrap gap-3 mb-8">
            {Object.entries(plans).map(([key, plan]) => {
              const IconComp = plan.icon;
              const isSelected = selectedPlan === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedPlan(key)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-300 shadow ${isSelected
                      ? `${plan.buttonColor} text-white shadow-lg scale-105`
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  <IconComp className="w-5 h-5" />
                  {plan.name}
                </button>
              );
            })}
          </div> */}

          <div className="grid lg:grid-cols-2 gap-8">
            <div className={`${selectedPlanDetails.bgColor} rounded-2xl p-6 shadow-lg`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-xl ${selectedPlanDetails.iconBg} shadow-inner`}>
                    <PlanIcon className={`w-8 h-8 ${selectedPlanDetails.textColor}`} />
                  </div>
                  <div>
                    <span className={`text-3xl font-bold ${selectedPlanDetails.textColor}`}>
                      {selectedPlanDetails.price}
                    </span>
                    <span className="text-gray-600 ml-2">{selectedPlanDetails.duration}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-5 h-5" />
                  <span>{selectedPlan === "freemium" ? "Gratuit mais limité" : "Facturation mensuelle"}</span>
                </div>
              </div>

              <h4 className={`font-bold text-lg mb-4 ${selectedPlanDetails.textColor}`}>Fonctionnalités :</h4>
              <ul className="space-y-3">
                {selectedPlanDetails.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div
                      className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${selectedPlanDetails.buttonColor.split(" ")[0]
                        }`}
                    >
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
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
                className={`w-full py-4 rounded-xl font-bold text-white text-lg transition-transform duration-300 hover:scale-105 shadow-lg ${selectedPlanDetails.buttonColor}`}
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