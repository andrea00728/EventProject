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

  return (
    <>
      <header className="w-full mx-auto bg-white shadow-md fixed mt-[-70px] z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="w-12 h-12 bg-white flex items-center justify-center rounded-md shadow-sm">
            <h1 className="text-lg font-bold text-[#336666]">Logo</h1>
          </div>
          <div className="hidden md:flex flex-1 items-center justify-center gap-6 text-[#336666] text-base font-medium">
            {navItems.map((item) => (
              <motion.div
                key={item.name} // Utilisez item.name comme key si path n'est pas unique entre "Accueil" et "Evenement"
                className="relative"
                initial="rest"
                whileHover="hover"
                onMouseEnter={() => item.name === "Evenement" && setIsEvenementHovered(true)}
                onMouseLeave={() => item.name === "Evenement" && setIsEvenementHovered(false)}
              >
                <Link
                  to={item.path}
                  className="hover:text-[#224444] transition relative z-10"
                >
                  {item.name}
                </Link>
                <motion.div
                  className="absolute bottom-0 left-0 h-0.5 bg-[#336666]"
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
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white shadow-lg rounded-lg py-4 px-6 z-40
                                   grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-6" 
                        style={{ minWidth: '25cm', maxWidth: '30cm' }} 
                        variants={subMenuVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                      >
                        {item.subMenus.map((subItem) => (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            className="flex flex-col items-center p-3 hover:bg-gray-100 rounded-md transition-colors cursor-pointer text-[#336666]"
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
          </div>
          <div className="flex items-center gap-3">
            <Profil />
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden bg-white shadow-md grid flex">
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-4 text-[#336666] text-base font-medium">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="hover:underline hover:text-[#224444] transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mt-16">
        <Outlet />
      </main>
    </>
  );
}