import React, { useState } from "react";
import { useStateContext } from "../context/ContextProvider";
import { Link, Navigate, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion"; // Importez AnimatePresence

export default function GuestLayout() {
  const { token } = useStateContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  console.log("GuestLayout rendu, token :", token); // Log pour déboguer

  if (token) {
    return <Navigate to="/accueil" replace />;
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
      <header className="w-full bg-white shadow-lg fixed top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-14 h-14 bg-indigo-100 flex items-center justify-center rounded-lg shadow-md">
              <h1 className="text-2xl font-bold text-[#336666]">Logo</h1>
            </div>
          </div>
          <nav className="hidden md:flex flex-1 items-center justify-center gap-8 text-[#336666] font-medium text-base">
          </nav>
          <div className="flex items-center gap-4">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <button className="hidden md:block flex items-center justify-center gap-2 text-white bg-gradient-to-r from-[#6B46C1] to-[#8B5CF6] font-semibold text-sm sm:text-base w-[110px] sm:w-[130px] h-10 rounded-xl hover:from-[#553C9A] hover:to-[#6B46C1] transition-all duration-200 shadow-sm">
                  <span>{item.name}</span>
                </button>
              </Link>
            ))}
            <button
              className="md:hidden p-2 text-[#336666] hover:text-[#6B46C1] transition-colors duration-200"
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
              className="md:hidden bg-white bg-opacity-95 shadow-md fixed inset-0 z-40"
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-4 text-[#336666] font-medium text-base animate-slideDown">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="px-4 py-2 hover:bg-gray-100 rounded-lg hover:text-[#6B46C1] transition-all duration-200"
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20 rounded-xl bg-gray-50 shadow-lg">
        <Outlet />
      </main>
    </>
  );
}