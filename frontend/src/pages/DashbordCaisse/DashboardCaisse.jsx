import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import {
  LucideReceipt,
  LucideCreditCard,
  LucideClipboardList,
  LucideBarChart,
  LucideDollarSign,
} from "lucide-react";
import { motion } from "framer-motion";
import { useStateContext } from "../../context/ContextProvider";

// Composant pour afficher une carte du tableau de bord
const DashboardCard = ({ name, icon, description, path, gradient }) => (
  <Link to={path} className="block">
    <motion.div
      whileHover={{ scale: 1.05, boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)" }}
      whileTap={{ scale: 0.95 }}
      className={`rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 text-center h-full flex flex-col items-center border border-gray-100 ${gradient}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * dashboardItems.findIndex(item => item.name === name), duration: 0.5, ease: "easeOut" }}
      aria-label={`Accéder à ${name}`}
    >
      <div className="mb-4 p-3 rounded-full bg-white/50">{icon}</div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">{name}</h2>
      <p className="text-sm text-gray-600">{description}</p>
    </motion.div>
  </Link>
);

// Liste des éléments du tableau de bord avec gradients
const dashboardItems = [
  {
    name: "Gestion des Commandes",
    icon: <LucideReceipt className="w-10 h-10 text-blue-600" />,
    path: "/gestion-commandes",
    description: "Prendre, modifier, visualiser les commandes.",
    gradient: "bg-gradient-to-br from-blue-100 to-blue-200",
  },
  {
    name: "Paiement",
    icon: <LucideCreditCard className="w-10 h-10 text-green-600" />,
    path: "/paiement",
    description: "Encaisser les paiements et émettre les factures.",
    gradient: "bg-gradient-to-br from-green-100 to-green-200",
  },
  {
    name: "Gestion du Stock",
    icon: <LucideClipboardList className="w-10 h-10 text-yellow-600" />,
    path: "/stock",
    description: "Consulter les stocks restants et l'historique.",
    gradient: "bg-gradient-to-br from-yellow-100 to-yellow-200",
  },
  {
    name: "Statistiques",
    icon: <LucideBarChart className="w-10 h-10 text-purple-600" />,
    path: "/statistiques",
    description: "Voir les performances de vente et les données clés.",
    gradient: "bg-gradient-to-br from-purple-100 to-purple-200",
  },
  {
    name: "Revenu",
    icon: <LucideDollarSign className="w-10 h-10 text-teal-600" />,
    path: "/revenu",
    description: "Consulter les revenus totaux et les rapports financiers.",
    gradient: "bg-gradient-to-br from-teal-100 to-teal-200",
  },
];

// Composant principal du tableau de bord
const Caisse = () => {
  const navigate = useNavigate();
  const { setToken } = useStateContext();

  // Gestion de la déconnexion
  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/pagepublic");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8 font-inter"
    >
      <div className="max-w-7xl mx-auto flex flex-col space-y-6">
        {/* En-tête */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Tableau de Bord Caisse
          </h1>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)" }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg shadow-md hover:from-red-700 hover:to-red-800 focus:ring-4 focus:ring-red-300 transition-all duration-300 text-sm font-semibold"
            aria-label="Se déconnecter"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Déconnexion
          </motion.button>
        </div>

        {/* Cartes du tableau de bord */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {dashboardItems.map((item, index) => (
            <DashboardCard key={index} {...item} />
          ))}
        </div>

        {/* Contenu des sous-routes */}
        <div className="mt-8">
          <Outlet />
        </div>
      </div>
    </motion.div>
  );
};

export default Caisse;