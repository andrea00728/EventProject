import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import {
  LucideReceipt,
  LucideUsers,
  LucideCreditCard,
  LucideBarChart,
  LucideClipboardList,
} from "lucide-react";
import { motion } from "framer-motion";
import { useStateContext } from "../../context/ContextProvider";


const DashboardCard = ({ name, icon, description, path }) => (
  <Link to={path} className="block">
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 text-center h-full flex flex-col items-center border border-gray-200"
    >
      <div className="mb-4 animate-pulse-slow">{icon}</div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">{name}</h2>
      <p className="text-sm text-gray-600">{description}</p>
    </motion.div>
  </Link>
);


const dashboardItems = [
  {
    name: "Gestion des Commandes",
    icon: <LucideReceipt className="w-10 h-10 text-blue-600" />,
    path: "/gestion-commandes",
    description: "Prendre, modifier, visualiser les commandes.",
  },
  {
    name: "Paiement",
    icon: <LucideCreditCard className="w-10 h-10 text-green-600" />,
    path: "/paiement",
    description: "Encaisser les paiements et émettre les factures.",
  },
  {
    name: "Gestion du Stock",
    icon: <LucideClipboardList className="w-10 h-10 text-yellow-500" />,
    path: "/stock",
    description: "Consulter les stocks restants et l'historique.",
  },
  {
    name: "Statistiques",
    icon: <LucideBarChart className="w-10 h-10 text-purple-500" />,
    path: "/statistiques",
    description: "Voir les performances de vente et les données clés.",
  },
  {
    name: "Factures et Historiques",
    icon: <LucideReceipt className="w-10 h-10 text-teal-500" />,
    path: "/factures-historique",
    description: "Accéder aux anciennes factures et à l'historique des ventes.",
  },
];

const Caisse = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/pagepublic");
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center p-6 sm:p-10"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542744095-291d1f67b221')" }}
    >
      <div className="bg-white/30 backdrop-blur-xl rounded-xl shadow-lg max-w-7xl mx-auto p-6 sm:p-10 relative">
        {/* Déconnexion */}
        <button
          onClick={handleLogout}
          className="absolute top-4 right-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Déconnexion
        </button>

        {/* Titre */}
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white text-center drop-shadow-md mb-10">
          Tableau de Bord Caisse
        </h1>

        {/* Cartes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardItems.map((item, index) => (
            <DashboardCard key={index} {...item} />
          ))}
        </div>

        <div className="mt-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Caisse;
