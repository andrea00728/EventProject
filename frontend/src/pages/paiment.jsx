
import { useState } from "react";
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
import { useStateContext } from "../context/ContextProvider"; // Pour récupérer le token
import { updateForfait } from "../services/forfaitService";

const plans = {
  freemium: {
    name: "Plan Freemium",
    price: "0€",
    duration: "/mois",
    icon: Gift,
    color: "gray",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    textColor: "text-gray-700",
    buttonColor: "bg-gray-600 hover:bg-gray-700",
    iconBg: "bg-gray-100",
    features: ["Accès basique", "Support communautaire", "1 utilisateur", "Fonctionnalités limitées"],
  },
  starter: {
    name: "Plan Starter",
    price: "19€",
    duration: "/mois",
    icon: Users,
    color: "blue",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-700",
    buttonColor: "bg-blue-600 hover:bg-blue-700",
    iconBg: "bg-blue-100",
    features: ["Accès standard", "Support email", "3 utilisateurs", "Statistiques de base"],
  },
  pro: {
    name: "Plan Pro",
    price: "49€",
    duration: "/mois",
    icon: Zap,
    color: "purple",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    textColor: "text-purple-700",
    buttonColor: "bg-purple-600 hover:bg-purple-700",
    iconBg: "bg-purple-100",
    features: ["Accès avancé", "Support prioritaire", "10 utilisateurs", "Analytiques avancées", "Intégrations"],
  },
  premium: {
    name: "Plan Premium",
    price: "89€",
    duration: "/mois",
    icon: Star,
    color: "emerald",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    textColor: "text-emerald-700",
    buttonColor: "bg-emerald-600 hover:bg-emerald-700",
    iconBg: "bg-emerald-100",
    features: ["Accès complet", "Support dédié", "50 utilisateurs", "Rapports personnalisés", "API complète"],
  },
  gold: {
    name: "Plan Gold",
    price: "149€",
    duration: "/mois",
    icon: Crown,
    color: "yellow",
    bgColor: "bg-yellow-50",
    borderColor: "border-[#FB9E3A]",
    textColor: "text-yellow-700",
    buttonColor: "bg-yellow-600 hover:bg-yellow-700",
    iconBg: "bg-yellow-100",
    features: ["Accès illimité", "Support 24/7", "Utilisateurs illimités", "Fonctionnalités exclusives", "Personnalisation complète"],
  },
};


const paymentMethods = [
  { id: "card", name: "Carte bancaire", icon: CreditCard },
  { id: "paypal", name: "PayPal", icon: DollarSign },
  { id: "mobile-money", name: "Mobile Money", icon: Smartphone },
  { id: "stripe", name: "Stripe", icon: Zap },
];

const PaymentPage = ({ forfait, onClose }) => {
  const { token } = useStateContext();
  const [selectedPlan, setSelectedPlan] = useState(forfait?.nom.toLowerCase() || "pro");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("card");
  const [loading, setLoading] = useState(false);

  if (!forfait) return null;

  const selectedPlanDetails = plans[selectedPlan];
  const PlanIcon = selectedPlanDetails.icon;

  const handlePayment = async () => {
    if (!token) {
      alert("Vous devez être connecté pour effectuer un paiement.");
      return;
    }

    setLoading(true);
    try {
      if (selectedPaymentMethod === "paypal") {
        const data = await updateForfait(token, selectedPlan);
        if (data.approvalUrl) {
          window.open(data.approvalUrl, "_blank");
        } else {
          alert("Erreur lors de la création du paiement PayPal");
        }
      } else {
        alert(`Paiement via ${selectedPaymentMethod} à implémenter`);
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la tentative de paiement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {forfait && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={onClose}
        >
          <motion.div
            className="bg-white w-full sm:max-w-5xl sm:h-[95vh] rounded-xl shadow-2xl p-6 sm:p-10 overflow-y-auto relative"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Bouton fermeture */}
            <button
              className="absolute top-5 right-5 text-gray-500 hover:text-gray-800 transition"
              onClick={onClose}
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* En-tête */}
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-4">{selectedPlanDetails.name}</h2>
              <p className="text-gray-600 text-lg">Choisissez votre plan et méthode de paiement</p>
            </div>

            {/* Sélecteur de plan */}
            <div className="flex flex-wrap gap-3 mb-8">
              {Object.entries(plans).map(([key, plan]) => {
                const IconComp = plan.icon;
                const isSelected = selectedPlan === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedPlan(key)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-300 shadow ${
                      isSelected
                        ? `${plan.buttonColor} text-white shadow-lg scale-105`
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <IconComp className="w-5 h-5" />
                    {plan.name}
                  </button>
                );
              })}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Détails plan */}
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
                        className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                          selectedPlanDetails.buttonColor.split(" ")[0]
                        }`}
                      >
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Méthode de paiement */}
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
                          className={`border-2 rounded-xl p-4 flex flex-col items-center cursor-pointer transition-all duration-300 ${
                            isSelected ? "border-blue-500 bg-blue-50 shadow-md" : "border-gray-200 hover:bg-gray-50"
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
        </div>
      )}
    </AnimatePresence>
  );
};

export default PaymentPage;
