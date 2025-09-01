import React, { useEffect, useState } from "react";
import { useStateContext } from "../context/ContextProvider";
import {
  Outlet,
  useNavigate,
  useLocation,
  Link,
  Navigate,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../assets/LogoAmsterTable.png";
import { FaUser } from "react-icons/fa";
import Profil from "../util/profils";
import { AuthModal } from "../components/Modal/authModal";
import { getUserForfait } from "../services/forfaitService";
import { getConditionalSubMenus } from "../util/menuUtils";
import { useSocket } from "../socket";

export default function PublicLayout() {
  const { isAuthenticated, role, user } = useStateContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [connected, setConnected] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isEvenementHovered, setIsEvenementHovered] = useState(false);
  const [isSubMenuOpenMobile, setIsSubMenuOpenMobile] = useState(false);
  const [forfait, setForfait] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isPublicEventsPage = location.pathname === "/evenements-publics";
  const socket = useSocket();

  const defaultNavItems = [
    { path: "/pagepublic#pagepublic", name: "Accueil" },
    { path: "/pagepublic#service", name: "Service" },
    { path: "/pagepublic#testimony", name: "Témoignages" },
    { path: "/pagepublic#forfaits", name: "Forfaits" },
    { path: "/pagepublic#contact", name: "Contact" },
  ];

  const [navItems, setNavItems] = useState(defaultNavItems);

  // Gérer le scroll vers une section de la page
  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);

  // Gérer la connexion, le forfait et la navigation
  useEffect(() => {
    const fetchAndSetForfait = async () => {
      try {
        const data = await getUserForfait();
        setForfait(data.forfait || { nom: "Default" });
      } catch (err) {
        console.error("Erreur lors de la récupération du forfait", err);
        setForfait({ nom: "Default" });
      }
    };

    if (isAuthenticated) {
      fetchAndSetForfait();
      setConnected(true);
      if (!socket) return;
      socket.on("connect", () => console.log("Socket connectée : ", socket.id));
    } else {
      setConnected(false);
      setForfait(null);
      setNavItems(defaultNavItems);
    }
  }, [isAuthenticated, role, user, navigate]);

  useEffect(() => {
    if (isAuthenticated && forfait) {
      setNavItems([
        { path: "/pagepublic#pagepublic", name: "Accueil" },
        {
          path: "#",
          name: "Evenement",
          subMenus: getConditionalSubMenus(forfait.nom || "Default"),
        },
        { path: "/pagepublic#service", name: "Service" },
        { path: "/pagepublic#testimony", name: "Témoignages" },
        { path: "/pagepublic#forfaits", name: "Forfaits" },
      ]);
    }
  }, [forfait, isAuthenticated]);

  const roles = ["caissier", "cuisinier", "accueil"];

  useEffect(() => {
    if (isAuthenticated) {
      // console.log("Token:", isAuthenticated, "User:", user, "Role:", role); // Debug log
      if (roles.includes(user?.role)) {
        navigate("/choix-role", { replace: true });
      } else if (!roles.includes(user?.role) && user?.role !== "organisateur") {
        navigate("/AdminAccueil", { replace: true });
      } else {
        navigate("/pagepublic", { replace: true });
      }
    }
  }, [isAuthenticated, user, role, navigate]);

  // Le reste du code...
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

  const handleDirection = (item) => {
    if (item.path.includes("#")) {
      const id = item.path.split("#")[1];
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(item.path);
    }
  };

  return (
    <>
      <header className="w-screen bg-white/90 backdrop-blur-xl shadow border-b fixed top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-20 h-20 bg-blue-100/1 rounded-2xl flex items-center justify-center">
              <img src={Logo} alt="Logo" className="w-20 h-auto object-cover" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold text-blue-700">Master Table</h1>
              <p className="text-xs text-gray-500">Créateurs d'événements</p>
            </div>
          </div>

          {/* Menu de navigation pour grand écran (desktop) */}
          <nav className="hidden md:flex items-center justify-center py-3 relative flex-1">
            <div className="flex items-center gap-1 mx-auto">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  className="group"
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
                    onClick={() => handleDirection(item)}
                  >
                    <span className="relative z-10">{item.name}</span>
                  </Link>

                  {item.subMenus && (
                    <AnimatePresence>
                      {isEvenementHovered && (
                        <motion.div
                          className="absolute top-full left-1/2 -translate-x-1/2 w-full max-w-7xl pt-2 z-40"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onMouseEnter={() => setIsEvenementHovered(true)}
                          onMouseLeave={() => setIsEvenementHovered(false)}
                        >
                          <motion.div
                            className="bg-white/98 backdrop-blur-xl shadow-2xl shadow-gray-900/15 rounded-xl border border-gray-200/60 w-full"
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
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                                      className="group block p-4 bg-white hover:bg-gradient-to-br hover:from-gray-50 hover:to-purple-50/30 rounded-lg transition-all duration-300 border border-gray-100 hover:border-purple-200 hover:shadow-md"
                                      onClick={() =>
                                        setIsEvenementHovered(false)
                                      }
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
                                      <p className="text-xs text-gray-600">
                                        {subItem.description}
                                      </p>
                                    </Link>
                                  </motion.div>
                                ))}
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
            {connected ? (
              <Profil />
            ) : (
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl ml-4"
              >
                Se connecter <FaUser className="w-5 h-5 text-white" />
              </button>
            )}
          </nav>

          {/* Bouton burger pour écrans mobiles */}
          <div className="flex items-center gap-2 md:hidden">
            {connected ? (
              <Profil />
            ) : (
              <button
                onClick={() => setModalOpen(true)}
                className="p-2 rounded bg-white shadow"
              >
                <FaUser className="w-5 h-5 text-gray-700" />
              </button>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded bg-white shadow"
            >
              <div className="w-6 h-6 relative flex flex-col justify-center items-center">
                <span
                  className={`block h-0.5 w-6 bg-gray-700 transform transition ${isMenuOpen ? "rotate-45 translate-y-1.5" : "-translate-y-1.5"}`}
                ></span>
                <span
                  className={`block h-0.5 w-6 bg-gray-700 my-1 transition ${isMenuOpen ? "opacity-0" : "opacity-100"}`}
                ></span>
                <span
                  className={`block h-0.5 w-6 bg-gray-700 transform transition ${isMenuOpen ? "-rotate-45 -translate-y-1.5" : "translate-y-1.5"}`}
                ></span>
              </div>
            </button>
          </div>
        </div>

        {/* Menu burger pour écrans mobiles (visible seulement si isMenuOpen est true) */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{
            opacity: isMenuOpen ? 1 : 0,
            height: isMenuOpen ? "auto" : 0,
          }}
          transition={{ duration: 0.3 }}
          className="md:hidden bg-white shadow border-t overflow-hidden"
        >
          <div className="px-4 py-4 space-y-3">
            {navItems.map((item) => (
              <div key={item.name}>
                {!item.subMenus ? (
                  <Link
                    to={item.path}
                    onClick={() => {
                      handleDirection(item);
                      setIsMenuOpen(false); // ferme le menu après clic
                    }}
                    className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded"
                  >
                    {item.name}
                  </Link>
                ) : (
                  <div>
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
                              onClick={() => {
                                setIsMenuOpen(false);
                                setIsSubMenuOpenMobile(false);
                              }}
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </header>
      <div className="h-20" />
      <main>
        <Outlet />
        <AuthModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          isSignIn={true}
        />
      </main>
    </>
  );
}
