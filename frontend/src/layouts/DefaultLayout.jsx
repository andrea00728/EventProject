import React, { useState } from "react";
import { useStateContext } from "../context/ContextProvider";
import { Link, Navigate, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Profil from "../util/profils";

export default function DefaultLayout() {
  const { token,role,isLoading } = useStateContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEvenementHovered, setIsEvenementHovered] = useState(false);

  if(isLoading) return <div>Chargement ...</div>
  if (!token) {
    return <Navigate to="/pagepublic"  replace/>;
  }
  switch (role) {
    case "organisateur":
      break; // Reste sur cette page
    case "accueil":
      return <Navigate to="/personnelAccueil" replace />;
    case "caissier":
      return <Navigate to="/personnelCaisse" replace />;
    case "cuisinier":
      return <Navigate to="/personnelCuisine" replace />;
    default:
      return <Navigate to="/pagepublic" replace />;
  }

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
        { path: "/evenement/rapports", name: "Invitation", icon: "/invitation.png" },
        { path: "/evenement/personnel", name: "Personnel", icon: "/community-center.png" },
        { path: "/evenement/facturation", name: "Facturation", icon: "/payment-method.png" },
      ],
    },
    { path: "/apropos", name: "A propos" },
  ];

  const subMenuVariants = {
    hidden: { opacity: 0, y: -10, pointerEvents: "none", transition: { duration: 0.18 } },
    visible: { opacity: 1, y: 0, pointerEvents: "auto", transition: { duration: 0.18 } },
  };

  const menuVariants = {
    open: { opacity: 1, height: "auto", transition: { duration: 0.3 } },
    closed: { opacity: 0, height: 0, transition: { duration: 0.3 } },
  };

  return (
    <>
      <header className="w-full bg-white shadow-2xl fixed top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-indigo-100 flex items-center justify-center rounded-xl shadow-lg border-4 border-indigo-200">
              <span className="text-3xl font-extrabold text-indigo-700 tracking-tight">🎟️</span>
            </div>
            <span className="ml-2 text-2xl font-bold text-indigo-700 tracking-wide hidden sm:block">TableMaster</span>
          </div>
          <nav className="hidden md:flex flex-1 items-center justify-center gap-8 text-indigo-900 font-medium text-base">
            {navItems.map((item) => (
              <motion.div
                key={item.name}
                className="relative group"
                initial="rest"
                whileHover="hover"
                onMouseEnter={() => item.name === "Evenement" && setIsEvenementHovered(true)}
                onMouseLeave={() => item.name === "Evenement" && setIsEvenementHovered(false)}
              >
                <Link
                  to={item.path}
                  className="px-4 py-2 hover:text-indigo-600 transition-colors duration-200 relative z-10 font-semibold tracking-wide"
                >
                  {item.name}
                </Link>
                <motion.div
                  className="absolute bottom-0 left-0 h-0.5 bg-indigo-600"
                  variants={{
                    rest: { width: 0 },
                    hover: { width: "100%" },
                  }}
                  transition={{ duration: 0.3 }}
                />
                {item.subMenus && (
                  <AnimatePresence>
                    {isEvenementHovered && (
                      <motion.div
                        className="absolute top-[1] left-1/2 -translate-x-1/2 mt-3  bg-white shadow-2xl rounded-2xl py-10 px-16 z-40
                          grid grid-cols-2 md:grid-cols-3 gap-x-1 gap-y-8 border-2 border-indigo-100"
                        style={{ minWidth: "33cm", maxWidth: "50cm", height: "400px" }} 
                        variants={subMenuVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                      >
                        {item.subMenus.map((subItem) => (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            className="flex flex-col items-center p-1 hover:bg-indigo-50 rounded-xl transition-colors duration-200 cursor-pointer text-indigo-800 hover:text-indigo-900"
                            onClick={() => setIsEvenementHovered(false)}
                          >
                            {subItem.icon && (
                              <img src={subItem.icon} alt={subItem.name} className="w-12 h-12 mb-3 drop-shadow" />
                            )}
                            <span className="text-lg font-semibold text-center">{subItem.name}</span>
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </motion.div>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <button
              className="hidden md:block px-5 py-2 bg-indigo-600 cursor-pointer text-white rounded-lg font-bold shadow hover:bg-indigo-700 transition-all duration-200 focus:ring-2 focus:ring-indigo-300 focus:outline-none"
              aria-label="Tutoriel"
            >
              Tutoriel
            </button>
            <Profil />
            <button
              className="md:hidden p-2 text-indigo-700 hover:text-indigo-900 transition-colors duration-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            </button>
          </div>
        </div>
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="md:hidden bg-white shadow-2xl border-b-2 border-indigo-100"
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-3 text-indigo-900 font-semibold text-lg">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="px-4 py-3 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-24">
        <Outlet />
      </main>
    </>
  );
}