{/* Importation des dépendances nécessaires */}
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
const DashboardCard = ({ name, icon, description, path }) => (
  <Link to={path} className="block">
    <motion.div
      whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)" }}
      whileTap={{ scale: 0.95 }}
      className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 text-center h-full flex flex-col items-center border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * dashboardItems.findIndex(item => item.name === name), duration: 0.4 }}
      aria-label={`Accéder à ${name}`}
    >
      <div className="mb-6">{icon}</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-3">{name}</h2>
      <p className="text-base text-gray-600">{description}</p>
    </motion.div>
  </Link>
);

// Liste des éléments du tableau de bord
const dashboardItems = [
  {
    name: "Gestion des Commandes",
    icon: <LucideReceipt className="w-12 h-12 text-blue-600" />,
    path: "/gestion-commandes",
    description: "Prendre, modifier, visualiser les commandes.",
  },
  {
    name: "Paiement",
    icon: <LucideCreditCard className="w-12 h-12 text-green-600" />,
    path: "/paiement",
    description: "Encaisser les paiements et émettre les factures.",
  },
  {
    name: "Gestion du Stock",
    icon: <LucideClipboardList className="w-12 h-12 text-yellow-600" />,
    path: "/stock",
    description: "Consulter les stocks restants et l'historique.",
  },
  {
    name: "Statistiques",
    icon: <LucideBarChart className="w-12 h-12 text-purple-600" />,
    path: "/statistiques",
    description: "Voir les performances de vente et les données clés.",
  },
  {
    name: "Revenu",
    icon: <LucideDollarSign className="w-12 h-12 text-teal-600" />,
    path: "/revenu",
    description: "Consulter les revenus totaux et les rapports financiers.",
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

  // Rendu de l'interface utilisateur
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex flex-col p-6 sm:p-8"
    >
      {/* Conteneur principal */}
      <div className="relative z-10 max-w-7xl mx-auto flex-1 flex flex-col space-y-8">
        {/* En-tête */}
        <div className="flex justify-between items-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            Tableau de Bord Caisse
          </h1>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)" }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 shadow-sm text-base font-semibold flex items-center gap-2"
            aria-label="Se déconnecter"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Déconnexion
          </motion.button>
        </div>

        {/* Cartes du tableau de bord */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardItems.map((item, index) => (
            <DashboardCard key={index} {...item} />
          ))}
        </div>

        {/* Contenu des sous-routes */}
        <div className="mt-10">
          <Outlet />
        </div>
      </div>
    </motion.div>
  );
};

export default Caisse;