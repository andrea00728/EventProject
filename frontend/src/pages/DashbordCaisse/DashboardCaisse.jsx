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

// Carte individuelle avec animation et style dynamique
const DashboardCard = ({ name, icon, description, path, gradient, index }) => (
  <Link to={path} className="group">
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index, duration: 0.5, ease: "easeOut" }}
      className={`relative overflow-hidden p-6 min-h-[260px] flex flex-col justify-between rounded-2xl shadow-lg border border-gray-200 backdrop-blur-md ${gradient} transition-all duration-300 transform group-hover:ring-2 group-hover:ring-offset-2 group-hover:ring-indigo-300`}
    >
      <div className="absolute inset-0 bg-white/40 opacity-10 rounded-2xl"></div>

      <div className="relative z-10 flex flex-col items-center text-center space-y-4">
        <div className="p-3 bg-white/70 rounded-full shadow-md">{icon}</div>
        <h3 className="text-xl font-bold text-gray-800">{name}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </motion.div>
  </Link>
);


// Données des cartes du dashboard
const dashboardItems = [
  {
    name: "Gestion des Commandes",
    icon: <LucideReceipt className="w-10 h-10 text-blue-600" />,
    path: "/gestion-commandes",
    description: "Prendre, modifier, visualiser les commandes.",
    gradient: "bg-gradient-to-tr from-blue-100 to-blue-200",
  },
  {
    name: "Paiement",
    icon: <LucideCreditCard className="w-10 h-10 text-green-600" />,
    path: "/paiement",
    description: "Encaisser les paiements et émettre les factures.",
    gradient: "bg-gradient-to-tr from-green-100 to-green-200",
  },
  {
    name: "Gestion du Stock",
    icon: <LucideClipboardList className="w-10 h-10 text-yellow-600" />,
    path: "/stock",
    description: "Consulter les stocks restants et l'historique.",
    gradient: "bg-gradient-to-tr from-yellow-100 to-yellow-200",
  },
  {
    name: "Statistiques",
    icon: <LucideBarChart className="w-10 h-10 text-purple-600" />,
    path: "/statistiques",
    description: "Voir les performances de vente et les données clés.",
    gradient: "bg-gradient-to-tr from-purple-100 to-purple-200",
  },
  {
    name: "Revenu",
    icon: <LucideDollarSign className="w-10 h-10 text-teal-600" />,
    path: "/revenu",
    description: "Consulter les revenus totaux et les rapports financiers.",
    gradient: "bg-gradient-to-tr from-teal-100 to-teal-200",
  },
];

const Caisse = () => {
  const navigate = useNavigate();
  const { setToken } = useStateContext();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/pagepublic");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 px-4 sm:px-6 lg:px-12 py-10"
    >
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-between items-center"
        >
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
            Tableau de Bord Caisse
          </h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow hover:from-red-600 hover:to-red-700 focus:ring-4 focus:ring-red-300 transition-all duration-300 text-sm font-semibold"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Déconnexion
          </motion.button>
        </motion.div>

        {/* Cartes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardItems.map((item, index) => (
            <DashboardCard key={index} {...item} index={index} />
          ))}
        </div>

        {/* Sous-routes */}
        <div className="mt-10">
          <Outlet />
        </div>
      </div>
    </motion.div>
  );
};

export default Caisse;
