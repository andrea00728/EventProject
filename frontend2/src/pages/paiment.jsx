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

// Définition du type pour un plan
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
        features: [
            "Accès basique",
            "Support communautaire",
            "1 utilisateur",
            "Fonctionnalités limitées",
        ],
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
        features: [
            "Accès standard",
            "Support email",
            "3 utilisateurs",
            "Statistiques de base",
        ],
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
        features: [
            "Accès avancé",
            "Support prioritaire",
            "10 utilisateurs",
            "Analytiques avancées",
            "Intégrations",
        ],
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
        features: [
            "Accès complet",
            "Support dédié",
            "50 utilisateurs",
            "Rapports personnalisés",
            "API complète",
        ],
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
        features: [
            "Accès illimité",
            "Support 24/7",
            "Utilisateurs illimités",
            "Fonctionnalités exclusives",
            "Personnalisation complète",
        ],
    },
};

const PaymentPage = () => {

    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("card");

    const paymentMethods = [
        {
            id: "card",
            name: "Carte bancaire",
            icon: CreditCard,
        },
        {
            id: "paypal",
            name: "PayPal",
            icon: DollarSign,
        },
        {
            id: "mobile-money",
            name: "Mobile Money",
            icon: Smartphone,
        },
        {
            id: "stripe",
            name: "Stripe",
            icon: Zap,
        },
    ];

    const [isOpenPaiement, setIsOpenPaiement] = useState(false)

    const [selectedPlan, setSelectedPlan] = useState("pro");

    const selectedPlanDetails = plans[selectedPlan];
    const PlanIcon = selectedPlanDetails.icon;

    const basePrice = parseInt(selectedPlanDetails.price.replace("€", ""));
    const serviceFee = selectedPlan === "freemium" ? 0 : 5;
    const vatAmount = Math.round((basePrice + serviceFee) * 0.2);
    const total = `${basePrice + serviceFee + vatAmount}€`;

    const items = [
        { label: "Abonnement mensuel", amount: selectedPlanDetails.price },
        { label: "Frais de service", amount: `${serviceFee}€` },
        { label: "TVA (20%)", amount: `${vatAmount}€` },
    ];

    return (
        <>
            {/* <button className="bg-gray-100 px-5 py-2 rounded-md" onClick={() => setIsOpenPaiement(true)}>grille paiment</button> */}

            <AnimatePresence>
                {isOpenPaiement && (
                    <div
                        className="fixed h-screen top-0 flex items-center justify-center inset-0 z-50 bg-black/60"
                        onClick={() => setIsOpenPaiement(false)}
                    >
                        <motion.div
                            className="bg-white w-screen h-full sm:max-w-5xl sm:h-[95vh] rounded-none sm:rounded-2xl shadow-2xl p-4 sm:p-8 overflow-y-auto"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="relative max-w-screen mx-auto">
                                {/* Bouton de fermeture */}
                                <button
                                    className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
                                    onClick={() => setIsOpenPaiement(false)}
                                >
                                    <svg
                                        className="w-7 h-7"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>



                                {/* Section 2: Détails et paiement */}
                                <div className="py-10 sm:py-12 bg-gray-50">
                                    <div className="px-4 sm:px-6">
                                        {/* Sélecteur de plans en en-tête */}
                                        <div className="mb-8">
                                            <div className="flex flex-wrap justify-center gap-4">
                                                {Object.entries(plans).map(([key, plan]) => {
                                                    const IconComponent = plan.icon;
                                                    return (
                                                        <button
                                                            key={key}
                                                            onClick={() => setSelectedPlan(key)}
                                                            className={`flex items-center space-x-2 px-5 py-2 rounded-lg font-medium transition-all duration-300 ${selectedPlan === key
                                                                ? `${plan.buttonColor} text-white shadow-md`
                                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                                }`}
                                                        >
                                                            <IconComponent className="w-5 h-5" />
                                                            <span>{plan.name}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                            {/* Section Plan */}
                                            <div>
                                                <div className="mb-6">
                                                    <p className="text-sm text-gray-500 mb-2">Plan sélectionné</p>
                                                    <h2 className="text-2xl font-bold text-gray-900">{selectedPlanDetails.name}</h2>
                                                </div>
                                                <div className={`${selectedPlanDetails.bgColor} rounded-xl p-6 mb-6`}>
                                                    <div className="flex items-center justify-between mb-6">
                                                        <div className="flex items-center space-x-4">
                                                            <div className="p-3 rounded-xl bg-white shadow-sm">
                                                                <PlanIcon className={`w-8 h-8 ${selectedPlanDetails.textColor}`} />
                                                            </div>
                                                            <div>
                                                                <span className={`text-3xl font-bold ${selectedPlanDetails.textColor}`}>
                                                                    {selectedPlanDetails.price}
                                                                </span>
                                                                <span className="text-gray-600 ml-2">{selectedPlanDetails.duration}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center text-gray-600">
                                                            <Clock className="w-5 h-5 mr-2" />
                                                            <span className="text-sm">
                                                                {selectedPlan === "freemium" ? "Gratuit à vie" : "Facturation mensuelle"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className={`font-bold text-lg mb-4 ${selectedPlanDetails.textColor}`}>
                                                            Fonctionnalités incluses :
                                                        </h4>
                                                        <div className="space-y-4">
                                                            {selectedPlanDetails.features.map((feature, index) => (
                                                                <div key={index} className="flex items-center">
                                                                    <div
                                                                        className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-3 ${selectedPlanDetails.buttonColor.split(" ")[0]
                                                                            }`}
                                                                    >
                                                                        <Check className="w-4 h-4 text-white" />
                                                                    </div>
                                                                    <span className="text-gray-700 font-medium">{feature}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Informations importantes */}
                                                <div className="bg-white rounded-xl p-6">
                                                    <h4 className="font-bold text-gray-900 mb-4">Informations importantes</h4>
                                                    <ul className="space-y-3">
                                                        {selectedPlan === "freemium" ? (
                                                            <>
                                                                <li className="flex items-start">
                                                                    <span className="text-green-500 mr-3 mt-1">•</span>
                                                                    <span className="text-gray-700">Accès gratuit permanent</span>
                                                                </li>
                                                                <li className="flex items-start">
                                                                    <span className="text-green-500 mr-3 mt-1">•</span>
                                                                    <span className="text-gray-700">Mise à niveau possible</span>
                                                                </li>
                                                                <li className="flex items-start">
                                                                    <span className="text-green-500 mr-3 mt-1">•</span>
                                                                    <span className="text-gray-700">Support communautaire</span>
                                                                </li>
                                                                <li className="flex items-start">
                                                                    <span className="text-green-500 mr-3 mt-1">•</span>
                                                                    <span className="text-gray-700">Fonctionnalités de base</span>
                                                                </li>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <li className="flex items-start">
                                                                    <span className="text-blue-500 mr-3 mt-1">•</span>
                                                                    <span className="text-gray-700">Renouvellement automatique</span>
                                                                </li>
                                                                <li className="flex items-start">
                                                                    <span className="text-blue-500 mr-3 mt-1">•</span>
                                                                    <span className="text-gray-700">Facture envoyée par email</span>
                                                                </li>
                                                                <li className="flex items-start">
                                                                    <span className="text-blue-500 mr-3 mt-1">•</span>
                                                                    <span className="text-gray-700">Support client 24/7</span>
                                                                </li>
                                                                <li className="flex items-start">
                                                                    <span className="text-blue-500 mr-3 mt-1">•</span>
                                                                    <span className="text-gray-700">Garantie satisfait ou remboursé 30 jours</span>
                                                                </li>
                                                            </>
                                                        )}
                                                    </ul>
                                                </div>
                                            </div>

                                            {/* Section Récapitulatif */}
                                            <div>
                                                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                                                    <div className="flex items-center mb-6">
                                                        <div className="p-3 bg-green-100 rounded-lg mr-4">
                                                            <CreditCard className="w-6 h-6 text-green-600" />
                                                        </div>
                                                        <h2 className="text-2xl font-bold text-gray-900">Récapitulatif</h2>
                                                    </div>
                                                    <div className="space-y-4 mb-6">
                                                        {items.map((item, index) => (
                                                            <div key={index} className="flex justify-between items-center py-2">
                                                                <span className="text-gray-600 font-medium">{item.label}</span>
                                                                <span className="font-bold text-gray-900">{item.amount}</span>
                                                            </div>
                                                        ))}
                                                        <hr className="border-gray-200 my-4" />
                                                        <div className="flex justify-between items-center py-2">
                                                            <span className="text-lg font-bold text-gray-900">Total</span>
                                                            <span className={`text-2xl font-bold ${selectedPlanDetails.textColor}`}>
                                                                {total}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {/* Méthodes de paiement */}
                                                    <div className="mb-6">
                                                        <h4 className="font-bold text-gray-900 mb-4">Méthode de paiement</h4>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            {paymentMethods.map((method) => {
                                                                const IconComponent = method.icon;
                                                                const isSelected = selectedPaymentMethod === method.id;

                                                                return (
                                                                    <div
                                                                        key={method.id}
                                                                        className={`border-2 rounded-lg p-4 text-center cursor-pointer transition-all duration-300 ${isSelected
                                                                                ? "border-blue-500 bg-blue-50"
                                                                                : "border-gray-200 opacity-50 hover:opacity-75"
                                                                            }`}
                                                                        onClick={() => setSelectedPaymentMethod(method.id)}
                                                                    >
                                                                        <IconComponent
                                                                            className={`w-7 h-7 mx-auto mb-2 ${isSelected ? "text-blue-600" : "text-gray-500"
                                                                                }`}
                                                                        />
                                                                        <span
                                                                            className={`text-sm font-medium ${isSelected ? "text-blue-700" : "text-gray-500"
                                                                                }`}
                                                                        >
                                                                            {method.name}
                                                                        </span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                    {/* Bouton d'action */}
                                                    <button
                                                        className={`w-full py-4 px-6 rounded-lg font-bold text-white text-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg ${selectedPlanDetails.buttonColor}`}
                                                    >
                                                        {selectedPlan === "freemium" ? "Commencer gratuitement" : "Confirmer l'abonnement"}
                                                    </button>
                                                    <div className="text-center mt-4">
                                                        <p className="text-sm text-gray-500">
                                                            {selectedPlan === "freemium"
                                                                ? "Aucun engagement requis"
                                                                : "Annulation possible à tout moment"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>

    );
};

export default PaymentPage;