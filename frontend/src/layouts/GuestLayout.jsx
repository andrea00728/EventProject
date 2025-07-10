import React, { useState } from "react";
import { useStateContext } from "../context/ContextProvider";
import { Link, Navigate, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ChatWidget from "../pages/ChatWidget";

export default function GuestLayout() {
  const { token,role } = useStateContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (token) {
    if(role==="organisateur"){
       return <Navigate to="/accueil" replace />;
    }
    if(role==="accueil"){
      return <Navigate to="/personnelAccueil" replace/>
    }
    if(role==="caissier"){
      return <Navigate to="/personnelCaisse" replace/>
    }
    if(role==="cuisinier"){
      return <Navigate to="/personnelCuisine" replace/>
    }
  }

  const navItems = [
    { path: "/inscription", name: "Inscription" },
  ];

  const menuVariants = {
    open: { opacity: 1, height: "auto", transition: { duration: 0.3 } },
    closed: { opacity: 0, height: 0, transition: { duration: 0.3 } },
  };

  return (
    <>
      <header className="w-full bg-gradient-to-r from-[#f8fafc] to-[#eef2ff] shadow-xl fixed top-0 z-50 border-b border-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-indigo-100 flex items-center justify-center rounded-2xl shadow-lg border border-indigo-200">
              <span className="text-3xl font-black text-indigo-700 tracking-tight">R</span>
            </div>
            <span className="ml-2 text-xl font-bold text-indigo-900 tracking-wide hidden sm:block">
              RAPEX Event
            </span>
          </div>
          {/* NAVIGATION À DROITE */}
          <nav className="flex items-center gap-10 text-indigo-800 font-semibold text-base">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <span className="px-6 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md hover:from-indigo-700 hover:to-indigo-600 transition font-bold tracking-wide">
                  {item.name}
                </span>
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4 md:hidden">
            <button
              className="p-2 text-indigo-700 hover:text-indigo-900 transition-colors duration-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
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
              className="md:hidden bg-white bg-opacity-95 shadow-xl fixed inset-0 z-40"
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col gap-6 text-indigo-800 font-semibold text-lg">
                <button
                  className="absolute top-6 right-8 text-3xl text-indigo-300 hover:text-red-500"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Fermer le menu"
                >
                  ×
                </button>
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md hover:from-indigo-700 hover:to-indigo-600 transition font-bold tracking-wide text-center"
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
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-12 mt-24 rounded-3xl bg-white shadow-2xl border border-indigo-100 min-h-[80vh]">
        <Outlet />
        <ChatWidget />
      </main>
      <footer className="w-full text-center py-6 text-gray-400 text-sm mt-10">
        © {new Date().getFullYear()} RAPEX Event. Tous droits réservés.
      </footer>
    </>
  );
}