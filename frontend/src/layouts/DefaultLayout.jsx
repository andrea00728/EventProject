import React, { useEffect, useState } from "react";
import { useStateContext } from "../context/ContextProvider";
import { Link, Navigate, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Profil from "../util/profils";
import ForfaitPage from "../pages/forfaitpage/forfaitpage";
import ChatWidget from "../pages/ChatWidget";
import { getUserForfait } from "../services/forfaitService";
import { ToastContainer } from "react-toastify";
import Logo from "../assets/LogoMaster.png"
 import NotificationComponent from "../util/notification";
import NotificationListener from "../util/Notification/notification";

import { getUserIdForToken } from "../services/userService";


import { io } from "socket.io-client";
import NotificationListener from "../util/Notification/notification_global";


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
        { 
          path: "/evenement", 
          name: "Organisations", 
          icon: "/red-carpet.png",
          description: "Gérez et organisez tous vos événements avec efficacité"
        },
        { 
          path: "/evenement/evenement", 
          name: "Événements", 
          icon: "/file.png",
          description: "Créez et planifiez vos événements en quelques clics"
        },
        { 
          path: "/evenement/tables", 
          name: "Tables", 
          icon: "/chair.png",
          description: "Configurez la disposition et l'agencement des tables"
        },
        { 
          path: "/evenement/invites", 
          name: "Invités", 
          icon: "/guest.png",
          description: "Gérez votre liste d'invités et leurs informations"
        },
        {
          path: "/evenement/invitation",
          name: "Invitations",
          icon: "/invitation.png",
          description: "Envoyez des invitations personnalisées et suivez les réponses"
        },
        {
          path: "/evenement/personnel",
          name: "Personnel",
          icon: "/community-center.png",
          description: "Coordonnez votre équipe et assignez les rôles et tâches"
        },
        //  Afficher seulement pour les forfaits premium
        ...(
          ["pro", "premium", "gold"].includes(forfait?.nom)
            ? [{
              path: "/evenement/restauration",
              name: "Restauration",
              icon: "/payment-method.png",
              description: "Gérez les menus et services de restauration premium"
            }]
            : []
        ),
      ]
    },
    { path: "/apropos", name: "A propos" },
  ];

  const subMenuVariants = {
    hidden: {
      opacity: 0,
      y: -8,
      scale: 0.96,
      pointerEvents: "none",
      transition: { duration: 0.2, ease: "easeOut" },
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      pointerEvents: "auto",
      transition: { duration: 0.2, ease: "easeOut" },
    },
  };

  const menuVariants = {
    open: { opacity: 1, height: "auto", transition: { duration: 0.9 } },
    closed: { opacity: 0, height: 0, transition: { duration: 0.9 } },
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
                  Master Table
                </h1>
                <p className="text-xs text-slate-400 -mt-1">Management Platform</p>
              </div>

            </motion.div>

            <nav className="hidden md:flex items-center justify-center py-3 relative">
              <div className="flex items-center gap-1">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.name}
                    className="relative group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Link
                      to={item.path}
                      className="px-4 py-2 text-gray-500 hover:text-blue-600 transition-all duration-300 relative font-semibold text-sm tracking-wide group-hover:scale-105 flex items-center gap-2"
                      onMouseEnter={() => item.name === "Evenement" && setIsEvenementHovered(true)}
                      onMouseLeave={() => item.name === "Evenement" && setIsEvenementHovered(false)}
                    >
                      <span className="relative z-10">{item.name}</span>
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300"></span>
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r rounded-xl opacity-0 group-hover:opacity-100"
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
                            className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-40"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onMouseEnter={() => setIsEvenementHovered(true)}
                            onMouseLeave={() => setIsEvenementHovered(false)}
                          >
                            <motion.div
                              className="bg-white/98 backdrop-blur-xl shadow-2xl shadow-gray-900/15 rounded-xl border border-gray-200/60"
                              style={{ width: "1200px" }}
                              variants={subMenuVariants}
                              initial="hidden"
                              animate="visible"
                              exit="hidden"
                            >
                              {/* En-tête compact */}
                              <div className="px-6 py-4 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h3 className="text-lg font-bold text-gray-900">Gestion d'événements</h3>
                                    <p className="text-xs text-gray-600">Organisez vos événements professionnellement</p>
                                  </div>
                                  <div className="text-xs bg-gradient-to-r from-[#6B46C1]/10 to-purple-600/10 text-purple-700 px-3 py-1 rounded-full border border-purple-200">
                                    {item.subMenus.length} modules
                                  </div>
                                </div>
                              </div>

                              {/* Grille des éléments - plus compacte */}
                              <div className="p-6">
                                <div className="grid grid-cols-4 gap-4">
                                  {item.subMenus.map((subItem, subIndex) => (
                                    <motion.div
                                      key={subItem.path}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ duration: 0.2, delay: subIndex * 0.03 }}
                                    >
                                      <Link
                                        to={subItem.path}
                                        className="group block p-4 bg-white hover:bg-gradient-to-br hover:from-gray-50 hover:to-purple-50/30 rounded-lg transition-all duration-300 border border-gray-100 hover:border-purple-200 hover:shadow-md"
                                        onClick={() => setIsEvenementHovered(false)}
                                      >
                                        {/* Icône et titre sur une ligne */}
                                        <div className="flex items-center gap-3 mb-2">
                                          <div className="flex-shrink-0 p-2.5 bg-gray-50 rounded-lg border border-gray-200 group-hover:border-purple-300 group-hover:bg-purple-50 transition-all duration-300">
                                            {subItem.icon && (
                                              <img
                                                src={subItem.icon}
                                                alt={subItem.name}
                                                className="w-5 h-5 group-hover:scale-110 transition-transform duration-300"
                                              />
                                            )}
                                          </div>
                                          <h4 className="text-sm font-semibold text-gray-900 group-hover:text-purple-700 transition-colors duration-300">
                                            {subItem.name}
                                          </h4>
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-600">
                                            {subItem.description}
                                          </p>
                                        </div>

                                        {/* Action discrète */}
                                        <div className="flex items-center justify-end">
                                          <div className="opacity-0 group-hover:opacity-100 transition-all duration-300">
                                            <svg className="w-3.5 h-3.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                          </div>
                                        </div>
                                      </Link>
                                    </motion.div>
                                  ))}
                                </div>
                              </div>

                              {/* Footer compact */}
                              <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 rounded-b-xl">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-gradient-to-r from-[#6B46C1] to-indigo-600 rounded-md flex items-center justify-center">
                                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                      </svg>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">Tableau de bord complet</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <button className="text-sm bg-gradient-to-r from-[#6B46C1] to-indigo-600 text-white px-4 py-1.5 rounded-md hover:shadow-md transition-all duration-300 font-medium">
                                      Nouveau
                                    </button>
                                    <button className="text-sm bg-white border border-gray-300 text-gray-700 px-4 py-1.5 rounded-md hover:bg-gray-50 transition-all duration-300">
                                      Voir tout
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
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
                    <div key={item.name} className=" bg-white/95 backdrop-blur-xl shadow-2xl shadow-purple-200/50 rounded-3xl py-2 absolute top-20 right-10">
                      {item.subMenus && (
                        <div className=" ml-4 mt-2 space-y-1">
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

              {/* notification  */}
              <div>
                <NotificationComponent/>
              </div>

              <div className="">
                <Profil />
              </div>

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