  import React, { useState } from "react";
  import { useStateContext } from "../context/ContextProvider";
  import { Link, Navigate, Outlet } from "react-router-dom";
  import { motion, AnimatePresence } from "framer-motion"; // Importez AnimatePresence
  import Profil from "../util/profils";

  export default function DefaultLayout() {
    const { token, isLoading } = useStateContext();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEvenementHovered, setIsEvenementHovered] = useState(false); 

    if (!token) {
      return <Navigate to="/pagepublic" />;
    }

    const navItems = [
      { path: "/accueil", name: "Accueil" },
      {
        path: "/accueil", 
        name: "Evenement",
        subMenus: [
          { path: "/evenement", name: "Organisations", icon: "../../public/red-carpet.png" },
          { path: "/evenement/brouillons", name: "evenement", icon: "../../public/file.png" },
          { path: "/evenement/tables", name: "Tables", icon: "../../public/chair.png" },
          { path: "/evenement/invites", name: "Invités", icon: "../../public/guest.png" },
          { path: "/evenement/rapports", name: "Invitation", icon: "../../public/invitation.png" },
          { path: "/evenement/facturation", name: "Facturation", icon: "../../public/payment-method.png" },
        ],
      },
      { path: "/apropos", name: "A propos" },
    ];
    

    const subMenuVariants = {
      hidden: { opacity: 0, y: -10, transition: { duration: 0.2 } },
      visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
    };

    const menuVariants = {
      open: { opacity: 1, height: "auto", transition: { duration: 0.3 } },
      closed: { opacity: 0, height: 0, transition: { duration: 0.3 } },
    };

    return (
      <>
        <header className="w-full bg-white shadow-lg fixed top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-indigo-100 flex items-center justify-center rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-indigo-700">Logo</h1>
              </div>
            </div>
            <nav className="hidden md:flex flex-1 items-center justify-center gap-8 text-gray-700 font-medium text-base">
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
                    className="px-4 py-2 hover:text-indigo-700 transition-colors duration-200 relative z-10"
                  >
                    {item.name}
                  </Link>
                  <motion.div
                    className="absolute bottom-0 left-0 h-0.5 bg-indigo-700"
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
                          className="absolute top-full left-2/2 -translate-x-1/2 mt-2 bg-white shadow-xl rounded-xl py-12 px-6 z-40
                                    grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-6"
                          style={{ minWidth: "30cm", maxWidth: "500px" }}
                          variants={subMenuVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                        >
                          {item.subMenus.map((subItem) => (
                            <Link
                              key={subItem.path}
                              to={subItem.path}
                              className="flex flex-col items-center p-3 hover:bg-gray-100 rounded-md transition-colors duration-200 cursor-pointer text-gray-700"
                              onClick={() => setIsEvenementHovered(false)}
                            >
                              {subItem.icon && (
                                <img src={subItem.icon} alt={subItem.name} className="w-10 h-10 mb-2" />
                              )}
                              <span className="text-sm font-medium text-center">{subItem.name}</span>
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
                className="hidden md:block px-4 py-2 bg-indigo-600 cursor-pointer text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                aria-label="Tutoriel"
              >
                Tutoriel
              </button>
              <Profil />
              <button
                className="md:hidden p-2 text-gray-700 hover:text-indigo-700 transition-colors duration-200"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                <svg
                  className="w-6 h-6"
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
                className="md:hidden bg-white shadow-md"
                variants={menuVariants}
                initial="closed"
                animate="open"
                exit="closed"
              >
                <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-2 text-gray-700 font-medium text-base">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
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
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">
          <Outlet />
        </main>
      </>
    );
  }