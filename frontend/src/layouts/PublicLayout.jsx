import React, { useEffect, useState } from "react";
import { useStateContext } from "../context/ContextProvider";
import { Outlet, useNavigate, useLocation, Link, Navigate } from "react-router-dom"; // ✅ ajout de Navigate ici
import { motion } from "framer-motion";
import Logo from "../assets/LogoMaster.png";
import { FaUser } from "react-icons/fa";
import Profil from "../util/profils";
import { AuthModal } from "../components/Modal/authModal";
import { useDarkMode } from "../context/DarkModeContext";

export default function PublicLayout() {
  const { token, role, user } = useStateContext();
  const { darkMode } = useDarkMode();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [connected, setConnected] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isPublicEventsPage = location.pathname === "/evenements-publics";

  const [navItems, setNavItems] = useState([
    { path: "#pagepublic", name: "Accueil" },
    { path: "#service", name: "Service" },
    { path: "#testimony", name: "Témoignages" },
    { path: "#forfaits", name: "Forfaits" },
    { path: "#contact", name: "Contact" },
  ]);

  useEffect(() => {
    if (token) {
      setConnected(true);
      if (user?.isInPersonnel) {
        navigate("/choix-role", { replace: true });
      } else if (role === "organisateur") {
        navigate("/pagepublic", { replace: true });
      } else {
        setNavItems([
          { path: "#pagepublic", name: "Accueil" },
          { path: "/evenements", name: "Evénement" },
          { path: "#service", name: "Service" },
          { path: "#testimony", name: "Témoignages" },
          { path: "#forfaits", name: "Forfaits" },
        ]);
      }
    } else {
      setConnected(false);
      setNavItems([
        { path: "#pagepublic", name: "Accueil" },
        { path: "#service", name: "Service" },
        { path: "#testimony", name: "Témoignages" },
        { path: "#forfaits", name: "Forfaits" },
        { path: "#contact", name: "Contact" },
      ]);
    }
  }, [token, user, role, navigate]);

  // Scroll smooth
  const handleSmoothScroll = (e, target) => {
    e.preventDefault();
    const element = document.querySelector(target);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
    }
  };

  // Redirections conditionnelles
  if (!user && token) {
    return <div>Chargement de l'utilisateur...</div>;
  }
  if (token && user?.isInPersonnel) {
    return <Navigate to="/choix-role" replace />;
  }
  if (token && role === "organisateur") {
    return <Navigate to="/pagepublic" replace />;
  }

  return (
    <>
      <header
        className={`w-screen backdrop-blur-xl shadow border-b fixed top-0 z-50 ${
          darkMode ? "bg-gray-800/90 text-white" : "bg-white/90 text-gray-700"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
              <img src={Logo} alt="Logo de Master Table" className="w-10 h-10" />
            </div>
            <div className="hidden sm:block">
              <h1
                className={`text-2xl font-bold ${
                  darkMode ? "text-blue-300" : "text-blue-700"
                }`}
              >
                Master Table
              </h1>
              <p className="text-xs text-gray-500">Créateurs d'événements</p>
            </div>
          </div>

          {/* Nav desktop */}
          <nav className="hidden lg:flex items-center gap-8">
            {!isPublicEventsPage &&
              navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={(e) => handleSmoothScroll(e, item.path)}
                  className={`text-sm font-semibold ${
                    darkMode
                      ? "text-gray-300 hover:text-blue-300"
                      : "text-gray-700 hover:text-blue-600"
                  } transition`}
                  aria-label={`Naviguer vers ${item.name}`}
                >
                  {item.name}
                </Link>
              ))}

            {connected ? (
              <Profil />
            ) : (
              <button
                onClick={() => setModalOpen(true)}
                className={`flex items-center gap-3 w-full px-4 py-3 font-semibold rounded-xl ${
                  darkMode
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                }`}
                aria-label="Ouvrir la fenêtre de connexion"
              >
                Se connecter
                <FaUser className="w-5 h-5 text-white relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            )}
          </nav>

          {/* Bouton menu mobile */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`lg:hidden p-2 rounded shadow ${
              darkMode ? "bg-gray-700" : "bg-white"
            }`}
            aria-label="Ouvrir ou fermer le menu mobile"
            aria-expanded={isMenuOpen}
          >
            <div className="w-6 h-6 relative flex flex-col justify-center items-center">
              <span
                className={`block h-0.5 w-6 transform transition ${
                  darkMode ? "bg-gray-300" : "bg-gray-700"
                } ${isMenuOpen ? "rotate-45 translate-y-1.5" : "-translate-y-1.5"}`}
              ></span>
              <span
                className={`block h-0.5 w-6 my-1 transition ${
                  darkMode ? "bg-gray-300" : "bg-gray-700"
                } ${isMenuOpen ? "opacity-0" : "opacity-100"}`}
              ></span>
              <span
                className={`block h-0.5 w-6 transform transition ${
                  darkMode ? "bg-gray-300" : "bg-gray-700"
                } ${isMenuOpen ? "-rotate-45 -translate-y-1.5" : "translate-y-1.5"}`}
              ></span>
            </div>
          </button>
        </div>

        {/* Menu mobile */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{
            opacity: isMenuOpen ? 1 : 0,
            height: isMenuOpen ? "auto" : 0,
          }}
          transition={{ duration: 0.3 }}
          className={`lg:hidden shadow border-t overflow-hidden ${
            darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-700"
          }`}
        >
          <div className="px-4 py-4 space-y-3">
            {!isPublicEventsPage &&
              navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={(e) => {
                    handleSmoothScroll(e, item.path);
                    setIsMenuOpen(false);
                  }}
                  className={`block px-4 py-2 rounded ${
                    darkMode
                      ? "hover:bg-gray-700"
                      : "hover:bg-blue-50 text-gray-700"
                  }`}
                  aria-label={`Naviguer vers ${item.name}`}
                >
                  {item.name}
                </Link>
              ))}

            {connected ? (
              <Profil />
            ) : (
              <button
                onClick={() => setModalOpen(true)}
                className={`flex items-center gap-3 w-full px-4 py-3 font-semibold rounded-xl ${
                  darkMode
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                }`}
                aria-label="Ouvrir la fenêtre de connexion"
              >
                Se connecter
                <FaUser className="w-5 h-5 text-white relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            )}
          </div>
        </motion.div>
      </header>

      <div className="h-20" />
      <main className={darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"}>
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
