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
import { MdDashboard, MdCalendarToday, MdRoom } from "react-icons/md";
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
    { path: "/AdminAccueil", name: "Tableau de bord", icon: <MdDashboard className="text-lg" /> },
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
      
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      
      <aside
        className={`fixed z-50 top-0 left-0 h-full w-64 transition-all duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 md:relative md:w-72
          ${darkMode ? "bg-gray-800 border-r border-gray-700" : "bg-white border-r border-gray-200"}`}
      >
        <div className="flex flex-col h-full">
          {/* Header Sidebar */}
          <div className="p-5 flex items-center justify-between border-b dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <img 
                src="../../public/images/logo_4.png" 
                alt="Logo" 
                className="w-10 h-10 rounded-lg object-cover"
              />
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Master Table
              </h1>
            </div>
            <button 
              className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <FaTimes className="text-lg" />
            </button>
          </div>

          {/* Menu Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <ul className="space-y-2">
              {menuItems.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200
                    ${
                      location.pathname === item.path
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                        : `${
                            darkMode 
                              ? "text-gray-200 hover:bg-gray-700 hover:text-white" 
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                          }`
                    }`}
                    onClick={() => isMobile && setSidebarOpen(false)}
                  >
                    <span className={`text-lg ${
                      location.pathname === item.path ? "text-white" : 
                      darkMode ? "text-gray-300" : "text-gray-500"
                    }`}>
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer Sidebar */}
          <div className="p-4 border-t dark:border-gray-700">
            <div className="flex flex-col space-y-3 mb-4">
              <button
                onClick={toggleDarkMode}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-colors
                ${
                  darkMode 
                    ? "bg-gray-700 text-blue-300 hover:bg-gray-600" 
                    : "bg-gray-100 text-blue-600 hover:bg-gray-200"
                }`}
              >
                {darkMode ? (
                  <>
                    <FaSun className="text-lg" />
                    <span className="text-sm font-medium">Mode Clair</span>
                  </>
                ) : (
                  <>
                    <FaMoon className="text-lg" />
                    <span className="text-sm font-medium">Mode Sombre</span>
                  </>
                )}
              </button>

              <button
                onClick={handleLogout}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-colors
                ${
                  darkMode
                    ? "text-red-300 hover:bg-gray-700 border border-red-300 hover:bg-opacity-50"
                    : "text-red-500 hover:bg-red-50 border border-red-300"
                }`}
              >
                <FaSignOutAlt className="text-lg" />
                <span className="text-sm font-medium">Déconnexion</span>
              </button>
            </div>
            <p className={`text-xs text-center ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}>
              © {new Date().getFullYear()} Master Table
            </p>
          </div>
        </div>
      </aside>

      
      <div className="flex-1 flex flex-col overflow-hidden">
       
        <main className="flex-1 overflow-auto p-0 bg-gray-50 dark:bg-gray-900">
          <div className={`h-full ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}