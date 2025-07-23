import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import {
  LucideReceipt,
  LucideUsers,
  LucideCreditCard,
  LucideBarChart,
  LucideClipboardList,
} from "lucide-react";
import { useStateContext } from "../../context/ContextProvider";

// const {user} = useStateContext();

const DashboardCard = ({ name, icon, description, path }) => (
  <Link to={path} className="block">
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition transform hover:-translate-y-1 p-6 text-center h-full flex flex-col items-center">
      <div className="mb-4">{icon}</div>
      <h2 className="text-lg font-semibold text-gray-800 mb-2">{name}</h2>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </Link>
);

const dashboardItems = [
  {
    name: "Gestion des Commandes",
    icon: <LucideReceipt className="w-8 h-8 text-blue-600" />,
    path: "/gestion-commandes",
    description: "Prendre, modifier, visualiser les commandes.",
  },
  {
    name: "Paiement",
    icon: <LucideCreditCard className="w-8 h-8 text-green-600" />,
    path: "/paiement",
    description: "Encaisser les paiements et émettre les factures.",
  },
  {
    name: "Gestion du Stock",
    icon: <LucideClipboardList className="w-8 h-8 text-yellow-600" />,
    path: "/stock",
    description: "Consulter les stocks restants et l'historique.",
  },
  {
    name: "Statistiques",
    icon: <LucideBarChart className="w-8 h-8 text-purple-600" />,
    path: "/statistiques",
    description: "Voir les performances de vente et les données clés.",
  },
  {
    name: "Factures et Historiques",
    icon: <LucideReceipt className="w-8 h-8 text-teal-600" />,
    path: "/factures-historique",
    description: "Accéder aux anciennes factures et à l'historique des ventes.",
  },
];

const Caisse = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token'); 
    navigate('/pagepublic'); 
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-10">
      <div className="max-w-7xl mx-auto relative">
        {/* Bouton Déconnexion en haut à droite */}
        
        <button
          onClick={handleLogout}
          className="absolute top-0 right-0 mt-4 mr-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          {/* <div className="">
          <img src={'${user.photo}'} alt="utilisateur" />
        </div>
        <div className="">
          <p>{user.name}</p>
        </div> */}
        </button>

        <h1 className="text-4xl font-extrabold text-gray-900 mb-10 text-center">
          Tableau de Bord Caisse
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardItems.map((item, index) => (
            <DashboardCard key={index} {...item} />
          ))}
        </div>

        <div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Caisse;
