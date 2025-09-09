import React, { useState, memo } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import {
  LucideReceipt,
  LucideCreditCard,
  LucideClipboardList,
  LucideBarChart,
  LucideDollarSign,
  LucideLogOut,
  LucideCheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStateContext } from "../../context/ContextProvider";
import axiosClient from "../../api/axios-client"; // ⚡ obligatoire car appel API logout

// === THEME ===
const theme = {
  colors: {
    primary: "bg-indigo-600",
    primaryHover: "bg-indigo-700",
    text: "text-gray-900",
    textSecondary: "text-gray-600",
    background: "bg-gray-50",
  },
  typography: {
    title: "text-4xl font-extrabold",
    subtitle: "text-xl font-bold",
    description: "text-sm font-medium",
  },
};


// === ANIMATIONS ===
const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const cardVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } } };

// === DASHBOARD ITEMS ===
const dashboardItems = [
  { name: "Gestion des Commandes", icon: <LucideReceipt className="w-10 h-10 text-blue-600" />, path: "/gestion-commandes", description: "Prendre, modifier, visualiser les commandes.", gradient: "bg-gradient-to-tr from-blue-100 to-blue-200" },
  { name: "Paiement", icon: <LucideCreditCard className="w-10 h-10 text-green-600" />, path: "/paiement", description: "Encaisser les paiements et émettre les factures.", gradient: "bg-gradient-to-tr from-green-100 to-green-200" },
  { name: "Gestion du Stock", icon: <LucideClipboardList className="w-10 h-10 text-yellow-600" />, path: "/stock", description: "Consulter les stocks restants et l'historique.", gradient: "bg-gradient-to-tr from-yellow-100 to-yellow-200" },
  { name: "Statistiques", icon: <LucideBarChart className="w-10 h-10 text-purple-600" />, path: "/statistiques", description: "Voir les performances de vente et les données clés.", gradient: "bg-gradient-to-tr from-purple-100 to-purple-200" },
  { name: "Revenu", icon: <LucideDollarSign className="w-10 h-10 text-teal-600" />, path: "/revenu", description: "Consulter les revenus totaux et les rapports financiers.", gradient: "bg-gradient-to-tr from-teal-100 to-teal-200" },
];

// === CARD ===
const DashboardCard = memo(({ name, icon, description, path, gradient }) => (
  <motion.div
    variants={cardVariants}
    whileHover={{ scale: 1.03, boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}
    whileTap={{ scale: 0.98 }}
    className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-2xl"
    tabIndex={0}
    onKeyDown={(e) => e.key === "Enter" && window.location.assign(path)}
  >
    <Link to={path} aria-label={`Accéder à ${name}`}>
      <div className={`relative overflow-hidden p-6 min-h-[260px] flex flex-col justify-between rounded-2xl shadow-md border border-white/20 backdrop-blur-lg ${gradient}`}>
        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
          <motion.div whileHover={{ scale: 1.1 }} className="p-4 bg-white/60 rounded-full shadow-md backdrop-blur-md">
            {icon}
          </motion.div>
          <h3 className={`${theme.typography.subtitle} ${theme.colors.text}`}>{name}</h3>
          <p className={`${theme.typography.description} ${theme.colors.textSecondary}`}>{description}</p>
        </div>
      </div>
    </Link>
  </motion.div>
));

// === TOAST ===
const LogoutToast = ({ onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
    className="fixed top-5 right-5 z-50 bg-white shadow-lg rounded-xl border border-gray-200 p-4 flex items-center gap-3"
  >
    <LucideCheckCircle className="w-6 h-6 text-green-500" />
    <div>
      <p className="text-sm font-semibold text-gray-800">Déconnexion réussie</p>
      <p className="text-xs text-gray-500">Redirection dans 2s...</p>
    </div>
    <button onClick={onClose} className="ml-3 text-gray-400 hover:text-gray-600">✕</button>
  </motion.div>
);

// === MAIN DASHBOARD ===
const Caisse = () => {
  const navigate = useNavigate();
  const { setUser, user, handleLogout } = useStateContext();
  const [showMenu, setShowMenu] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // 🔴 Logout direct (fusion de LogoutButton ici)
  const onLogoutClick = async () => {
    try {
      await axiosClient.post("/auth/logout"); // API call backend
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
      sessionStorage.removeItem("ACCESS_TOKEN");
      sessionStorage.removeItem("USER");
      setUser(null);
      if (handleLogout) handleLogout(); // reset global context si dispo
      setConfirmLogout(false);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        navigate("/", { replace: true });
      }, 2000);
    }
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
            Tableau de Bord Caisse
          </h1>

          {/* Menu utilisateur */}
          <div className="relative">
            <button
              onClick={() => setShowMenu((prev) => !prev)}
              className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-lg"
            >
              <img src={user?.avatar || "https://i.pravatar.cc/150"} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-indigo-500" />
              <span className="text-sm font-medium">{user?.name || "Utilisateur"}</span>
            </button>

            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 max-h-60 overflow-y-auto bg-white rounded-lg shadow-lg border z-50"
                >
                  <button
                    onClick={() => setConfirmLogout(true)}
                    className="flex items-center px-4 py-3 w-full text-left text-red-600 hover:bg-red-50"
                  >
                    <LucideLogOut className="w-5 h-5 mr-2" />
                    Déconnexion
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

        {/* DASHBOARD CARDS */}
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" variants={containerVariants}>
          {dashboardItems.map((item, i) => <DashboardCard key={i} {...item} />)}
        </motion.div>

        {/* SUBROUTES */}
        <Outlet />
      </div>

      {/* Popup Confirmation */}
      <AnimatePresence>
        {confirmLogout && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl p-6 shadow-2xl w-80 text-center">
              <LucideLogOut className="w-8 h-8 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Confirmation</h2>
              <p className="text-sm text-gray-600 mb-6">Voulez-vous vraiment vous déconnecter ?</p>
              <div className="flex justify-center gap-4">
                <button onClick={() => setConfirmLogout(false)} className="px-4 py-2 bg-gray-200 rounded-lg">Annuler</button>
                <button onClick={onLogoutClick} className="px-4 py-2 bg-red-500 text-white rounded-lg">Oui, déconnecter</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>{showToast && <LogoutToast onClose={() => setShowToast(false)} />}</AnimatePresence>
    </motion.div>
  );
};

export default Caisse;
