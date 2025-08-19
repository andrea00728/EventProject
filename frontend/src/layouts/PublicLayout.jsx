import React, { useEffect, useState } from "react";
import { useStateContext } from "../context/ContextProvider";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Logo from "../assets/LogoMaster.png";
import { FaUser } from "react-icons/fa";
import Profil from "../util/profils";
import { AuthModal } from "../components/Modal/authModal";

export default function PublicLayout() {
  const { token, role, user } = useStateContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [connected, setConnected] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isPublicEventsPage = location.pathname === "/evenements-publics";

  // navItems par défaut
  const [navItems, setNavItems] = useState([
    { path: "#pagepublic", name: "Accueil" },
    { path: "#service", name: "Service" },
    { path: "#testimony", name: "Témoignages" },
    { path: "#forfaits", name: "Forfaits" },
    { path: "#contact", name: "Contact" },
  ]);
  if (role) {
      switch (role) {
        case "accueil":
          navigate("/personnelAccueil", { replace: true });
          break;
        case "caissier":
          navigate("/personnelCaisse", { replace: true });
          break;
        case "cuisinier":
          navigate("/personnelCuisine", { replace: true });
          break;
        case "organisateur":
          navigate("/pagepublic", { replace: true });
          break;
        default:
          navigate("/pagepublic", { replace: true });
          break;
      }
    }

  // Gestion des rôles et de la connexion
  useEffect(() => {
    if (token) {
      if (user?.isInPersonnel) {
        navigate("/choix-role", { replace: true });
      }
      setNavItems([
        { path: "#pagepublic", name: "Accueil" },
        { path: "#", name: "Evénement" },
        { path: "#service", name: "Service" },
        { path: "#testimony", name: "Témoignages" },
        { path: "#forfaits", name: "Forfaits" },
      ]);
      setConnected(true);
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
  }, [token, role, user, navigate]);

  // Scroll smooth
  const handleSmoothScroll = (e, target) => {
    e.preventDefault();
    const element = document.querySelector(target);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
    }
  };

  return (
    <>
      <header className="w-screen bg-white/90 backdrop-blur-xl shadow border-b fixed top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
              <img src={Logo} alt="Logo" className="w-10 h-10" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold text-blue-700">Master Table</h1>
              <p className="text-xs text-gray-500">Créateurs d'événements</p>
            </div>
          </div>

          {/* Nav desktop */}
          <nav className="hidden lg:flex items-center gap-8">
            {!isPublicEventsPage &&
              navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.path}
                  onClick={(e) => handleSmoothScroll(e, item.path)}
                  className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition"
                >
                  {item.name}
                </a>
              ))}

            {connected ? (
              <Profil />
            ) : (
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-3 w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl"
              >
                Se connecter{" "}
                <FaUser className="w-5 h-5 text-white relative z-10 transition-transform duration-300" />
              </button>
            )}
          </nav>

          {/* Bouton menu mobile */}
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

        {/* Menu mobile */}
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
              navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.path}
                  onClick={(e) => {
                    handleSmoothScroll(e, item.path);
                    setIsMenuOpen(false);
                  }}
                  className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded"
                >
                  {item.name}
                </a>
              ))}

            {connected ? (
              <Profil />
            ) : (
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-3 w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl"
              >
                Se connecter{" "}
                <FaUser className="w-5 h-5 text-white relative z-10 transition-transform duration-300" />
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
