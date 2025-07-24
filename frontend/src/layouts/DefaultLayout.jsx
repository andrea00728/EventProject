import React, { useEffect, useState } from "react";
import { useStateContext } from "../context/ContextProvider";
import { Link, Navigate, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Profil from "../util/profils";
import ForfaitPage from "../pages/forfaitpage/forfaitpage";
import ChatWidget from "../pages/ChatWidget";
import { getUserForfait } from "../services/forfaitService";
import NotificationListener from "../util/Notification/notification";
import { ToastContainer } from "react-toastify";
import Logo from "../assets/LogoMaster.png"

export default function DefaultLayout() {
  const { token, role, isLoading } = useStateContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEvenementHovered, setIsEvenementHovered] = useState(false);
  const [forfait, setForfait] = useState(null);
  const [showForfaitModal, setShowForfaitModal] = useState(false);

  //  Ne pas continuer si en chargement
  if (isLoading) return <div>Chargement ...</div>;

  // 🔐 Rediriger si non connecté
  if (!token) return <Navigate to="/pagepublic" replace />;

  // Rediriger selon rôle
  switch (role) {
    case "organisateur":
      break;
    case "accueil":
      return <Navigate to="/personnelAccueil" replace />;
    case "caissier":
      return <Navigate to="/personnelCaisse" replace />;
    case "cuisinier":
      return <Navigate to="/personnelCuisine" replace />;
    default:
      return <Navigate to="/pagepublic" replace />;
  }


  useEffect(() => {
    const fetchAndSetForfait = async () => {
      try {
        const data = await getUserForfait(token);
        setForfait(data.forfait);
      } catch (err) {
        console.error("Erreur lors de la récupération du forfait", err);
      }
    };

    fetchAndSetForfait();

    // Mettre à jour dynamiquement après activation
    const handleForfaitUpdate = () => {
      fetchAndSetForfait();
    };

    window.addEventListener("forfaitUpdated", handleForfaitUpdate);
    return () => {
      window.removeEventListener("forfaitUpdated", handleForfaitUpdate);
    };
  }, [token]);

  //  Configuration dynamique du menu
  const navItems = [
    { path: "/accueil", name: "Accueil" },
    {
      path: "/accueil",
      name: "Evenement",
      subMenus: [
        { path: "/evenement", name: "Organisations", icon: "/red-carpet.png" },
        { path: "/evenement/evenement", name: "evenement", icon: "/file.png" },
        { path: "/evenement/tables", name: "Tables", icon: "/chair.png" },
        { path: "/evenement/invites", name: "Invités", icon: "/guest.png" },
        { path: "/evenement/invitation", name: "Invitation", icon: "/invitation.png" },
        { path: "/evenement/personnel", name: "Personnel", icon: "/community-center.png" },
        //  Afficher seulement pour les forfaits premium
        ...(
          ["pro", "premium", "gold"].includes(forfait?.nom)
            ? [{
              path: "/evenement/restauration",
              name: "restauration",
              icon: "/payment-method.png"
            }]
            : []
        ),
      ]
    },
    { path: "/apropos", name: "A propos" }
  ];

  const subMenuVariants = {
    hidden: { opacity: 0, y: -10, pointerEvents: "none", transition: { duration: 0.4 } },
    visible: { opacity: 1, y: 0, pointerEvents: "auto", transition: { duration: 0.4 } }
  };

  const menuVariants = {
    open: { opacity: 1, height: "auto", transition: { duration: 0.9 } },
    closed: { opacity: 0, height: 0, transition: { duration: 0.9 } }
  };

  return (
    <>
      <header className="w-screen backdrop-blur-md fixed top-0 z-50 ">
        <div className="max-w-screen mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Bar avec logo et actions */}
          <div className="h-18 px-10 pt-5 flex items-center justify-between">
            {/* Logo Section */}
            <motion.div
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-[#6B46C1] to-indigo-600 flex items-center justify-center rounded-2xl shadow-xl border border-purple-300/30">
                  <img src={Logo} className="w-8 h-8 drop-shadow-lg" alt="Logo" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full animate-pulse"></div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-[#6B46C1] to-indigo-500 bg-clip-text text-transparent">
                  EventMaster
                </h1>
                <p className="text-xs text-slate-400 -mt-1">Management Platform</p>
              </div>

            </motion.div>

            <nav className="hidden md:flex items-center justify-center py-3 ">
              <div className="flex items-center gap-1">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.name}
                    className="relative group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    onMouseEnter={() => item.name === "Evenement" && setIsEvenementHovered(true)}
                    onMouseLeave={() => item.name === "Evenement" && setIsEvenementHovered(false)}
                  >
                    <Link
                      to={item.path}
                      className="relative px-6 py-3 text-violet-500 hover:text-white font-medium transition-all duration-300 rounded-xl hover:bg-violet-700/50"
                    >
                      <span className="relative z-10">{item.name}</span>
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-[#6B46C1]/20 to-indigo-600/20 rounded-xl opacity-0 group-hover:opacity-100"
                        transition={{ duration: 0.3 }}
                      />
                      <motion.div
                        className="absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 bg-gradient-to-r from-[#6B46C1] to-indigo-500 rounded-full"
                        initial={{ width: 0 }}
                        whileHover={{ width: "70%" }}
                        transition={{ duration: 0.3 }}
                      />
                    </Link>


                    {item.subMenus && (
                      <AnimatePresence>
                        {isEvenementHovered && (
                          <motion.div
                            className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-white/95 backdrop-blur-xl shadow-2xl shadow-purple-200/50 rounded-3xl p-8 z-40 border border-purple-200/60"
                            style={{ minWidth: "800px", maxWidth: "1000px" }}
                            variants={subMenuVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                          >
                            {/* En-tête du sous-menu */}
                            <div className="text-center mb-8">
                              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#6B46C1]/10 via-purple-600/10 to-indigo-600/10 backdrop-blur-sm border border-purple-200 rounded-full px-4 py-2 text-sm font-medium text-purple-700 shadow-sm mb-3">
                                <div className="w-2 h-2 bg-gradient-to-r from-[#6B46C1] to-purple-600 rounded-full animate-pulse"></div>
                                Gestion d'événements
                              </div>
                              <h3 className="text-xl font-bold text-slate-800">
                                Organisez et gérez tous vos événements en un clic
                              </h3>
                            </div>

                            <div className="grid grid-cols-3 gap-6">
                              {item.subMenus.map((subItem, subIndex) => (
                                <motion.div
                                  key={subItem.path}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.4, delay: subIndex * 0.1 }}
                                >
                                  <Link
                                    to={subItem.path}
                                    className="group flex flex-col items-center p-6 hover:bg-gradient-to-br hover:from-purple-50 hover:to-indigo-50 rounded-2xl transition-all duration-300 cursor-pointer border border-transparent hover:border-purple-200 hover:shadow-lg hover:shadow-purple-100"
                                    onClick={() => setIsEvenementHovered(false)}
                                  >
                                    {/* Container de l'icône avec effet glassmorphism */}
                                    <div className="relative mb-4 p-4 bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200 group-hover:border-purple-300 group-hover:shadow-lg group-hover:shadow-purple-100 transition-all duration-300">
                                      {subItem.icon && (
                                        <img
                                          src={subItem.icon}
                                          alt={subItem.name}
                                          className="w-8 h-8 group-hover:scale-110 transition-transform duration-300"
                                        />
                                      )}

                                      {/* Effet de fond animé */}
                                      <div className="absolute inset-0 bg-gradient-to-br from-[#6B46C1]/10 via-purple-600/10 to-indigo-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                      {/* Point lumineux */}
                                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-[#6B46C1] via-purple-600 to-indigo-600 rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-300"></div>
                                    </div>

                                    {/* Titre avec gradient au hover */}
                                    <span className="text-sm font-bold text-slate-700 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#6B46C1] group-hover:via-purple-600 group-hover:to-indigo-600 text-center transition-all duration-300 leading-tight">
                                      {subItem.name}
                                    </span>

                                    {/* Description pour organisateur */}
                                    <p className="text-xs text-slate-500 text-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                      Créer et gérer vos {subItem.name.toLowerCase()}
                                    </p>

                                    {/* Flèche indicatrice */}
                                    <div className="mt-3 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                      <svg className="w-4 h-4 text-[#6B46C1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                      </svg>
                                    </div>
                                  </Link>
                                </motion.div>
                              ))}
                            </div>

                            {/* Footer du sous-menu pour organisateurs */}
                            <div className="mt-8 pt-6 border-t border-purple-200">
                              <div className="text-center">
                                <p className="text-xs text-slate-500 mb-3">
                                  Tableau de bord complet pour organiser, suivre et analyser vos événements
                                </p>
                                <div className="flex justify-center gap-3">
                                  <button className="text-xs bg-gradient-to-r from-[#6B46C1] via-purple-600 to-indigo-600 text-white px-4 py-2 rounded-full hover:shadow-lg hover:shadow-purple-200 transition-all duration-300 font-medium hover:from-[#553C9A] hover:via-purple-700 hover:to-indigo-700">
                                    Créer un événement
                                  </button>
                                  <button className="text-xs bg-white border border-purple-200 text-purple-700 px-4 py-2 rounded-full hover:border-purple-300 hover:shadow-md hover:bg-purple-50 transition-all duration-300 font-medium">
                                    Voir mes événements
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Décorations de fond */}
                            <div className="absolute top-4 right-6 w-20 h-20 bg-gradient-to-r from-[#6B46C1]/5 via-purple-600/5 to-indigo-600/5 rounded-full blur-xl animate-pulse" />
                            <div className="absolute bottom-4 left-6 w-16 h-16 bg-gradient-to-l from-indigo-600/8 to-purple-600/5 rounded-full blur-lg animate-pulse delay-1000" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}


                  </motion.div>
                ))}
              </div>
            </nav>

            {/* Mobile Navigation */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.nav
                  className="md:hidden border-t border-slate-700/30 py-4"
                  variants={menuVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                >
                  {navItems.map((item) => (
                    <div key={item.name} className="py-2">
                      <Link
                        to={item.path}
                        className="block px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                      {item.subMenus && (
                        <div className="ml-4 mt-2 space-y-1">
                          {item.subMenus.map((subItem) => (
                            <Link
                              key={subItem.path}
                              to={subItem.path}
                              className="flex items-center gap-3 px-4 py-2 text-sm text-slate-400 hover:text-slate-300 hover:bg-slate-800/30 rounded-lg transition-colors duration-200"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              {subItem.icon && (
                                <img src={subItem.icon} alt={subItem.name} className="w-5 h-5" />
                              )}
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </motion.nav>
              )}
            </AnimatePresence>

            {/* Actions Section */}
            <div className="flex items-center gap-3">
              <motion.button
                onClick={() => setShowForfaitModal(true)}
                className="group relative overflow-hidden bg-gradient-to-r from-[#6B46C1] via-purple-600 to-indigo-600 text-white font-medium px-5 py-2.5 rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-sm">Forfaits</span>
                </div>
              </motion.button>

              <Profil />

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-gradient-to-r from-[#6B46C1]/10 to-indigo-600/10 border border-purple-200 text-purple-700 hover:text-white hover:bg-gradient-to-r hover:from-[#6B46C1] hover:via-purple-600 hover:to-indigo-600 hover:border-transparent transition-all duration-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

          </div>
          {/* Navigation Bar */}

        </div>


      </header>

      <div className="">
        <ForfaitPage open={showForfaitModal} onClose={() => setShowForfaitModal(false)} />
      </div>

      <main className="max-w-screen mx-auto mt-24">
        <NotificationListener />
        <ToastContainer position="top-right" />
        <Outlet />
        <ChatWidget />
      </main>

    </>
  );
}