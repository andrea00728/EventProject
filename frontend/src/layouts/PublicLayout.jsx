import React, { useEffect, useState } from "react";
import { useStateContext } from "../context/ContextProvider";
import { Outlet, useNavigate, useLocation, Link, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../assets/LogoMaster.png";
import { FaUser } from "react-icons/fa";
import Profil from "../util/profils";
import { AuthModal } from "../components/Modal/authModal";
import { getUserForfait } from "../services/forfaitService";

export default function PublicLayout() {
  const { token, role, user } = useStateContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [connected, setConnected] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isEvenementHovered, setIsEvenementHovered] = useState(false);
  const [isSubMenuOpenMobile, setIsSubMenuOpenMobile] = useState(false);
  const [forfait, setForfait] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isPublicEventsPage = location.pathname === "/evenements-publics";
  // Handle variations in pathname (e.g., /pagepublic, /pagepublic/)
  const isPublicPage = location.pathname === "/pagepublic" || location.pathname === "/pagepublic/";

  // Log context state for debugging
  console.log("PublicLayout Context:", { token, role, user, pathname: location.pathname });

  // Define base submenus
  const baseSubMenus = [
    {
      path: "/evenement",
      name: "Organisations",
      icon: "/red-carpet.png",
      description: "Gérez et organisez tous vos événements avec efficacité",
    },
    {
      path: "/evenement/evenement",
      name: "Événements",
      icon: "/file.png",
      description: "Créez et planifiez vos événements en quelques clics",
    },
    {
      path: "/evenement/tables",
      name: "Tables",
      icon: "/chair.png",
      description: "Configurez la disposition et l'agencement des tables",
    },
    {
      path: "/evenement/invites",
      name: "Invités",
      icon: "/guest.png",
      description: "Gérez votre liste d'invités et leurs informations",
    },
    {
      path: "/evenement/invitation",
      name: "Invitations",
      icon: "/invitation.png",
      description: "Envoyez des invitations personnalisées et suivez les réponses",
    },
  ];

  // Add conditional submenus based on forfait
  const conditionalSubMenus = [];
  if (!forfait) {
    conditionalSubMenus.push(...baseSubMenus);
  } else if (forfait?.nom === "starter") {
    conditionalSubMenus.push(...baseSubMenus, {
      path: "/evenement/personnel",
      name: "Personnel",
      icon: "/invitation.png",
      description: "Coordonnez votre équipe et assignez les rôles et tâches",
    });
  } else if (["pro", "premium", "gold"].includes(forfait?.nom)) {
    conditionalSubMenus.push(
      ...baseSubMenus,
      {
        path: "/evenement/personnel",
        name: "Personnel",
        icon: "/invitation.png",
        description: "Coordonnez votre équipe et assignez les rôles et tâches",
      },
      {
        path: "/evenement/restauration",
        name: "Restauration",
        icon: "/payment-method.png",
        description: "Gérez les menus et services de restauration premium",
      }
    );
  }

  const [navItems, setNavItems] = useState([
    { path: "#pagepublic", name: "Accueil" },
    { path: "#service", name: "Service" },
    { path: "#testimony", name: "Témoignages" },
    { path: "#forfaits", name: "Forfaits" },
    { path: "#contact", name: "Contact" },
  ]);

  // Handle roles, connection, and forfait
  useEffect(() => {
    const fetchAndSetForfait = async () => {
      try {
        const data = await getUserForfait(token);
        console.log("Forfait fetched:", data.forfait); // Debug forfait
        setForfait(data.forfait || null);
      } catch (err) {
        console.error("Erreur lors de la récupération du forfait:", err);
        setForfait(null); // Fallback to null if API fails
      }
    };

    console.log("useEffect called:", { token, user, isPublicPage });

    if (token) {
      fetchAndSetForfait();
      if (user?.isInPersonnel) {
        console.log("Redirecting to /choix-role due to isInPersonnel");
        navigate("/choix-role", { replace: true });
        return;
      }
      setNavItems([
        { path: "/accueil", name: "Accueil" },
        {
          path: "/accueil",
          name: "Evenement",
          subMenus: conditionalSubMenus,
        },
        { path: "/apropos", name: "A propos" },
      ]);
      setConnected(true);
    } else {
      setConnected(false);
      setForfait(null); // Reset forfait for non-connected users
      setNavItems([
        { path: "#pagepublic", name: "Accueil" },
        { path: "#service", name: "Service" },
        { path: "#testimony", name: "Témoignages" },
        { path: "#forfaits", name: "Forfaits" },
        { path: "#contact", name: "Contact" },
      ]);
    }
  }, [token, user, navigate]);

  // Role-based redirection, but skip if already on /pagepublic
  if (role && !isPublicPage) {
    console.log("Applying role-based redirection:", { role });
    switch (role) {
      case "accueil":
        return <Navigate to="/personnelAccueil" replace />;
      case "caissier":
        return <Navigate to="/personnelCaisse" replace />;
      case "cuisinier":
        return <Navigate to="/personnelCuisine" replace />;
      case "organisateur":
        return <Navigate to="/accueil" replace />;
      default:
        return <Navigate to="/pagepublic" replace />;
    }
  }

  // Smooth scroll handler
  const handleSmoothScroll = (e, target) => {
    e.preventDefault();
    const element = document.querySelector(target);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
      setIsSubMenuOpenMobile(false);
    } else {
      console.warn("Scroll target not found:", target);
    }
  };

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

  return (
    <>
      <header className="w-screen bg-white/90 backdrop-blur-xl shadow border-b fixed top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
              <img src={Logo} alt="Logo" className="w-10 h-10" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold text-blue-700">Master Table</h1>
              <p className="text-xs text-gray-500">Créateurs d'événements</p>
            </div>
          </div>

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
                    onMouseEnter={() =>
                      item.name === "Evenement" && setIsEvenementHovered(true)
                    }
                    onMouseLeave={() =>
                      item.name === "Evenement" && setIsEvenementHovered(false)
                    }
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
                            <div className="px-6 py-4 border-b border-gray-100">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="text-lg font-bold text-gray-900">
                                    Gestion d'événements
                                  </h3>
                                  <p className="text-xs text-gray-600">
                                    Organisez vos événements professionnellement
                                  </p>
                                </div>
                                <div className="text-xs bg-gradient-to-r from-[#6B46C1]/10 to-purple-600/10 text-purple-700 px-3 py-1 rounded-full border border-purple-200">
                                  {item.subMenus.length} modules
                                </div>
                              </div>
                            </div>

                            <div className="p-6">
                              <div className="grid grid-cols-4 gap-4">
                                {item.subMenus.map((subItem, subIndex) => (
                                  <motion.div
                                    key={subItem.path}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                      duration: 0.2,
                                      delay: subIndex * 0.03,
                                    }}
                                  >
                                    <Link
                                      to={subItem.path}
                                      className="group block p-4 bg-white hover:bg-gradient-to-br hover:from-gray-50 hover:to-purple-50/30 rounded-lg transition-all duration-300 border border-gray-200 hover:border-purple-200 hover:shadow-md"
                                      onClick={() => setIsEvenementHovered(false)}
                                    >
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
                                      <div className="flex items-center justify-end">
                                        <div className="opacity-0 group-hover:opacity-100 transition-all duration-300">
                                          <svg
                                            className="w-3.5 h-3.5 text-purple-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M9 5l7 7-7 7"
                                            />
                                          </svg>
                                        </div>
                                      </div>
                                    </Link>
                                  </motion.div>
                                ))}
                              </div>
                            </div>

                            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 rounded-b-xl">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 bg-gradient-to-r from-[#6B46C1] to-indigo-600 rounded-md flex items-center justify-center">
                                    <svg
                                      className="w-3 h-3 text-white"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 10V3L4 14h7v7l9-11h-7z"
                                      />
                                    </svg>
                                  </div>
                                  <span className="text-sm font-medium text-gray-900">
                                    Tableau de bord complet
                                  </span>
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
              {connected ? (
                <Profil />
              ) : (
                <button
                  onClick={() => setModalOpen(true)}
                  className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl"
                >
                  Se connecter <FaUser className="w-5 h-5 text-white" />
                </button>
              )}
            </div>
          </nav>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded bg-white shadow"
          >
            <div className="w-6 h-6 relative flex flex-col justify-center items-center">
              <span
                className={`block h-0.5 w-6 bg-gray-700 transform transition ${
                  isMenuOpen ? "rotate-45 translate-y-1.5" : "-translate-y-1.5"
                }`}
              ></span>
              <span
                className={`block h-0.5 w-6 bg-gray-700 my-1 transition ${
                  isMenuOpen ? "opacity-0" : "opacity-100"
                }`}
              ></span>
              <span
                className={`block h-0.5 w-6 bg-gray-700 transform transition ${
                  isMenuOpen ? "-rotate-45 -translate-y-1.5" : "translate-y-1.5"
                }`}
              ></span>
            </div>
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{
            opacity: isMenuOpen ? 1 : 0,
            height: isMenuOpen ? "auto" : 0,
          }}
          transition={{ duration: 0.3 }}
          className="lg:hidden bg-white shadow border-t overflow-hidden"
        >
          <div className="px-4 py-4 space-y-3">
            {!isPublicEventsPage &&
              navItems.map((item) =>
                !item.subMenus ? (
                  <a
                    key={item.name}
                    href={item.path}
                    onClick={(e) => handleSmoothScroll(e, item.path)}
                    className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded"
                  >
                    {item.name}
                  </a>
                ) : (
                  <div key={item.name}>
                    <button
                      onClick={() =>
                        setIsSubMenuOpenMobile(!isSubMenuOpenMobile)
                      }
                      className="flex justify-between items-center w-full px-4 py-2 text-gray-700 hover:bg-blue-50 rounded"
                    >
                      {item.name}
                      <span>{isSubMenuOpenMobile ? "▲" : "▼"}</span>
                    </button>
                    <AnimatePresence>
                      {isSubMenuOpenMobile && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="pl-4"
                        >
                          {item.subMenus.map((sub) => (
                            <Link
                              key={sub.path}
                              to={sub.path}
                              className="block px-4 py-2 text-gray-600 hover:text-blue-600 transition"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              )}

            {connected ? (
              <Profil />
            ) : (
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-3 w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl"
              >
                Se connecter <FaUser className="w-5 h-5 text-white" />
              </button>
            )}
          </div>
        </motion.div>
      </header>

      <div className="h-20" />
      <main>
        <Outlet />
      </main>

      <AuthModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        isSignIn={true}
      />
    </>
  );
}