import React, { useEffect, useState } from "react";
import { useStateContext } from "../context/ContextProvider";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../assets/LogoMaster.png";
import { FaUser } from "react-icons/fa";
import Profil from "../util/profils";
import { AuthModal } from "../components/Modal/authModal";

export default function PublicLayout() {
  const { token, role, user } = useStateContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [connected, setConnected] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isEvenementHovered, setIsEvenementHovered] = useState(false);
  const [isSubMenuOpenMobile, setIsSubMenuOpenMobile] = useState(false);

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

  const navItems1 = [
    { path: "/pagepublic", name: "Accueil" },
    {
      path: "/pagepublic",
      name: "Evenement",
      subMenus: [
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
          description:
            "Envoyez des invitations personnalisées et suivez les réponses",
        },
        {
          path: "/evenement/personnel",
          name: "Personnel",
          icon: "/invitation.png",
          description:
            "Coordonnez votre équipe et assignez les rôles et tâches",
        },
      ],
    },
    { path: "#service", name: "Service" },
    { path: "#testimony", name: "Témoignages" },
    { path: "#forfaits", name: "Forfaits" },
  ];

  useEffect(() => {
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

    if (token) {
      if (user?.isInPersonnel) {
        navigate("/choix-role", { replace: true });
      }
      setNavItems(navItems1);
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

  const handleSmoothScroll = (e, target) => {
    e.preventDefault();
    const element = document.querySelector(target);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
      setIsSubMenuOpenMobile(false);
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

          {/* Desktop Navigation */}
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
                  </Link>

                  {item.subMenus && (
                    <AnimatePresence>
                      {isEvenementHovered && (
                        <motion.div
                          className="absolute top-full left-1/2 -translate-x-1/2 -ml-31 pt-2 z-40"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onMouseEnter={() => setIsEvenementHovered(true)}
                          onMouseLeave={() => setIsEvenementHovered(false)}
                        >
                          <motion.div
                            className="bg-white/98 backdrop-blur-xl shadow-2xl shadow-gray-900/15 rounded-xl border border-gray-200/60"
                            style={{ width: "1200px" }} // reste large
                            variants={subMenuVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                          >
                            {/* En-tête */}
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

                            {/* Grille */}
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
                className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl"
              >
                Se connecter <FaUser className="w-5 h-5 text-white" />
              </button>
            )}
          </nav>

          {/* Mobile Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded bg-white shadow"
          >
            <div className="w-6 h-6 relative flex flex-col justify-center items-center">
              <span
                className={`block h-0.5 w-6 bg-gray-700 transform transition ${isMenuOpen ? "rotate-45 translate-y-1.5" : "-translate-y-1.5"
                  }`}
              ></span>
              <span
                className={`block h-0.5 w-6 bg-gray-700 my-1 transition ${isMenuOpen ? "opacity-0" : "opacity-100"
                  }`}
              ></span>
              <span
                className={`block h-0.5 w-6 bg-gray-700 transform transition ${isMenuOpen ? "-rotate-45 -translate-y-1.5" : "translate-y-1.5"
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
