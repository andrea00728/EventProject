import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  FaCogs,
  FaUsers,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaMoon,
  FaSun,
  FaUserCircle
} from "react-icons/fa";
import { FiLayout } from "react-icons/fi";
import { MdCalendarToday, MdRoom } from "react-icons/md";
import { useDarkMode } from "../context/DarkModeContext";

export default function AdminLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { darkMode, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setSidebarOpen(false);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { path: "/AdminAccueil", name: "Tableau de bord", icon: <FiLayout className="text-lg" /> },
    { path: "/AdminEvenement", name: "Événements", icon: <MdCalendarToday className="text-lg" /> },
    { path: "/AdminOrganisateur", name: "Organisateurs", icon: <FaUsers className="text-lg" /> },
    { path: "/LocationSalle", name: "Salles & Localisation", icon: <MdRoom className="text-lg" /> },
    { path: "/AdminParametre", name: "Paramètres", icon: <FaCogs className="text-lg" /> },
  ];

  const handleLogout = () => {
    console.log("Déconnexion");
  };

  return (
    <div className={`flex h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      {/* Overlay pour mobile */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Bouton Burger flottant */}
      <button
        className={`fixed z-30 top-4 left-4 p-2 rounded-lg transition-all duration-300 md:hidden
          ${darkMode 
            ? "bg-gray-700 text-gray-200 hover:bg-gray-600" 
            : "bg-white text-gray-600 hover:bg-gray-100"} shadow-md hover:scale-105`}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed z-50 top-0 left-0 h-full w-64 transition-all duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 md:relative md:w-72
          ${darkMode ? "bg-gray-800" : "bg-gray-200"}`}
      >
        <div className="flex flex-col h-full">
          {/* Header Sidebar */}
          <div className="p-5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="../../public/images/logo_4.png" 
                alt="Logo" 
                className="w-10 h-10 rounded-lg object-cover transition-transform duration-300 hover:scale-110"
              />
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Master Table
              </h1>
            </div>
            <button 
              className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-300 hover:rotate-90"
              onClick={() => setSidebarOpen(false)}
            >
              <FaTimes className="text-lg" />
            </button>
          </div>

          {/* Menu Navigation avec animations */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <ul className="space-y-2">
              {menuItems.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 transform
                    ${
                      location.pathname === item.path
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-[1.02]"
                        : `${
                            darkMode 
                              ? "text-gray-200 hover:bg-gray-700 hover:text-white" 
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                          } hover:translate-x-1 hover:scale-[1.02]`
                    }`}
                    onClick={() => isMobile && setSidebarOpen(false)}
                  >
                    <span className={`text-lg transition-transform duration-300 ${
                      location.pathname === item.path ? "text-white scale-110" : 
                      darkMode ? "text-gray-300 group-hover:scale-110" : "text-gray-500 group-hover:scale-110"
                    }`}>
                      {item.icon}
                    </span>
                    <span className="transition-all duration-300">{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer Sidebar avec animations */}
          <div className="p-4">
            <div className="flex flex-col space-y-3 mb-4">
              <button
                onClick={toggleDarkMode}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 transform
                ${
                  darkMode 
                    ? "bg-gray-700 text-blue-300 hover:bg-gray-600 hover:scale-[1.02]" 
                    : "bg-gray-100 text-blue-600 hover:bg-gray-200 hover:scale-[1.02]"
                }`}
              >
                {darkMode ? (
                  <>
                    <FaSun className="text-lg transition-transform duration-300 hover:rotate-12" />
                    <span className="text-sm font-medium">Mode Clair</span>
                  </>
                ) : (
                  <>
                    <FaMoon className="text-lg transition-transform duration-300 hover:rotate-12" />
                    <span className="text-sm font-medium">Mode Sombre</span>
                  </>
                )}
              </button>

              <button
                onClick={handleLogout}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 transform
                ${
                  darkMode
                    ? "text-red-300 hover:bg-gray-700 hover:bg-opacity-50 hover:scale-[1.02]"
                    : "text-red-500 hover:bg-red-50 hover:scale-[1.02]"
                }`}
              >
                <FaSignOutAlt className="text-lg transition-transform duration-300 hover:translate-x-1" />
                <span className="text-sm font-medium">Déconnexion</span>
              </button>
            </div>
            <p className={`text-xs text-center transition-colors duration-300 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}>
              © {new Date().getFullYear()} Master Table
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto scrollable p-0 bg-gray-50 dark:bg-gray-900">
          <div className={`h-full ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}