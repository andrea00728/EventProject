import React, { useState } from "react";
import { useStateContext } from "../context/ContextProvider";
import { Link, Navigate, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../assets/LogoMaster.png"
import ChatWidget from "../pages/ChatWidget";

export default function GuestLayout() {
  const { token, role, user } = useStateContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navItems = [
    { path: "#pagepublic", name: "Accueil" },
    { path: "#service", name: "Service" },
    { path: "#contact", name: "Contact" },
    { path: "#testimony", name: "Testimony" }
  ];
  // if (token) {
  //   if(role==="organisateur"){
  //      return <Navigate to="/accueil" replace />;
  //   }
  //   if(role==="accueil"){
  //     return <Navigate to="/personnelAccueil" replace/>
  //   }
  //   if(role==="caissier"){
  //     return <Navigate to="/personnelCaisse" replace/>
  //   }
  //   if(role==="cuisinier"){
  //     return <Navigate to="/personnelCuisine" replace/>
  //   }
  // }

  if (token) {
    if (user?.isInPersonnel) {
      return <Navigate to="/choix-role" replace />
    }

    if (role === "organisateur") {
      return <Navigate to="/accueil" replace />;
    }
  }

  // const navItems = [
  //   { path: "/inscription", name: "Inscription" },
  // ];

  const menuVariants = {
    open: { opacity: 1, height: "auto", transition: { duration: 0.3 } },
    closed: { opacity: 0, height: 0, transition: { duration: 0.3 } },
  };

  return (
    <>
      {/* Header Moderne avec Design Cohérent */}
      <header className="w-screen bg-gradient-to-r from-white via-blue-50/20 to-purple-50/10 backdrop-blur-xl shadow-xl border-b border-gray-100/50 fixed top-0 z-50 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">

          {/* Logo Section */}
          <div className="flex items-center gap-3 group">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 via-purple-100 to-blue-50 flex items-center justify-center rounded-2xl shadow-lg border-2 border-blue-200/30 group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <img
                src={Logo}
                alt="Logo EventPro"
                className="w-10 h-10 object-contain filter drop-shadow-sm"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent tracking-wide">
                EventPro
              </h1>
              <p className="text-xs text-gray-500 font-medium -mt-1">Créateurs d'événements</p>
            </div>
          </div>

          {/* Navigation Desktop */}
          <nav className="hidden lg:flex flex-1 items-center justify-center gap-8">
            {navItems.map((item, index) => (
              <motion.div
                key={item.name}
                className="relative group"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {item.path.startsWith("#") ? (
                  <a
                    href={item.path}
                    onClick={(e) => handleSmoothScroll(e, item.path)}
                    className="px-4 py-2 text-gray-700 hover:text-blue-600 transition-all duration-300 relative font-semibold text-sm tracking-wide group-hover:scale-105 flex items-center gap-2"
                  >
                    {item.name}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300"></span>
                  </a>
                ) : (
                  <Link
                    to={item.path}
                    className="px-4 py-2 text-gray-700 hover:text-blue-600 transition-all duration-300 relative font-semibold text-sm tracking-wide group-hover:scale-105 flex items-center gap-2"
                  >
                    {item.name}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300"></span>
                  </Link>
                )}
              </motion.div>
            ))}
          </nav>

          {/* CTA & Menu Mobile */}
          <div className="flex items-center gap-4">
            {/* Bouton CTA Desktop */}
            <div className="hidden md:block">
              <button
                onClick={(e) => handleSmoothScroll(e, '#contact')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 text-sm"
              >
                <span className="flex items-center gap-2">
                  Inscription
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </button>
            </div>

            {/* Bouton Menu Mobile */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-white/80 backdrop-blur-sm shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200"
            >
              <div className="w-6 h-6 relative flex flex-col justify-center items-center">
                <span className={`block h-0.5 w-6 bg-gray-700 transform transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-0' : '-translate-y-2'}`}></span>
                <span className={`block h-0.5 w-6 bg-gray-700 transform transition-all duration-300 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                <span className={`block h-0.5 w-6 bg-gray-700 transform transition-all duration-300 ${isMenuOpen ? '-rotate-45 translate-y-0' : 'translate-y-2'}`}></span>
              </div>
            </button>
          </div>
        </div>

        {/* Menu Mobile Dropdown */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{
            opacity: isMenuOpen ? 1 : 0,
            height: isMenuOpen ? 'auto' : 0
          }}
          transition={{ duration: 0.3 }}
          className="lg:hidden overflow-hidden bg-white/95 backdrop-blur-xl border-t border-gray-100"
        >
          <div className="px-4 py-6 space-y-4">
            {navItems.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{
                  opacity: isMenuOpen ? 1 : 0,
                  x: isMenuOpen ? 0 : -20
                }}
                transition={{ delay: index * 0.1 }}
                className="block"
              >
                {item.path.startsWith("#") ? (
                  <a
                    href={item.path}
                    onClick={(e) => handleSmoothScroll(e, item.path)}
                    className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-all duration-200 font-semibold text-base"
                  >
                    {item.name}
                  </a>
                ) : (
                  <Link
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-all duration-200 font-semibold text-base"
                  >
                    {item.name}
                  </Link>
                )}
              </motion.div>
            ))}

            {/* CTA Mobile */}
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={(e) => handleSmoothScroll(e, '#contact')}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg text-base"
              >
                <span className="flex items-center justify-center gap-2">
                  ✨ Devis Gratuit
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      </header>

      {/* Spacer pour compenser le header fixed */}
      <div className="h-20"></div>

      <main>
        <Outlet />
      </main>
    </>
  );

}