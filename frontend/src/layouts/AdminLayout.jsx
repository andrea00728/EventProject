import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  FaCogs,
  FaUsers,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaMoon,
  FaSun,
} from "react-icons/fa";
import { MdDashboard, MdCalendarToday, MdRoom } from "react-icons/md";
import { useDarkMode } from "../context/DarkModeContext"; // ✅ useDarkMode context

export default function AdminLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { darkMode, toggleDarkMode } = useDarkMode(); // ✅ Context utilisé ici

  const choixItems = [
    { path: "/AdminAccueil", name: "Tableau de bord", icon: <MdDashboard /> },
    { path: "/AdminEvenement", name: "Evénements", icon: <MdCalendarToday /> },
    { path: "/AdminOrganisateur", name: "Organisateurs", icon: <FaUsers /> },
    { path: "/LocationSalle", name: "Salles & Localisation", icon: <MdRoom /> },
    { path: "/AdminParametre", name: "Paramètres", icon: <FaCogs /> },
  ];

  const handleLogout = () => {
    console.log("Déconnexion");
  };

  const gradientTitle =
    "bg-gradient-to-r from-blue-500 via-violet-500 to-purple-300 bg-clip-text text-transparent";
  const gradientButton =
    "bg-gradient-to-r from-blue-500 via-violet-500 to-purple-400 text-white";

  const pageBg = darkMode
    ? "bg-gray-900 text-gray-100"
    : "bg-gradient-to-r from-white to-gray-50 text-gray-800";

  return (
    <div className="flex h-screen transition duration-300 dark:bg-gray-900">
      <aside
        className={`fixed z-50 top-0 left-0 h-full w-72 shadow-lg transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:block ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div
          className={`flex flex-col h-full justify-between ${
            darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-900"
          }`}
        >
          <div>
            <img src="../../public/images/logo_4.png" alt="Logo" className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-center mb-6 text-indigo-600 dark:text-white">
              Master Table
            </h1>

            <nav>
              <ul className="space-y-2">
                {choixItems.map((item, index) => (
                  <li key={index}>
                    <Link
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-2 rounded-0.5g font-medium transition-all duration-200 transform
                      ${
                        location.pathname === item.path
                          ? "bg-indigo-500 text-white shadow-md dark:bg-indigo-600"
                          : "text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 hover:scale-105"
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="text-xl">{item.icon}</span>
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 mt-6 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
            >
              <FaSignOutAlt />
              Déconnexion
            </button>
          </div>

          <div className="flex flex-col items-center gap-2 mb-4">
            <button
              onClick={toggleDarkMode}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-gray-100 hover:scale-105 transition"
            >
              {darkMode ? <FaSun /> : <FaMoon />}
              {darkMode ? "Mode Jour" : "Mode Nuit"}
            </button>

            <footer className="text-xs text-center text-gray-400 dark:text-gray-500">
              © {new Date().getFullYear()} Master Table. Tous droits réservés.
            </footer>
          </div>
        </div>
      </aside>

      <div className={`flex-1 flex flex-col overflow-auto ${darkMode ? "bg-gray-800" : "bg-white"}`}>
        <header
          className={`flex items-center justify-between px-6 py-4 border-b dark:border-gray-700 shadow-md md:hidden ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <button
            className="text-2xl text-gray-700 dark:text-gray-300"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </header>

        <main className="flex-1 bg-gray-100 dark:bg-gray-900">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl shadow pl-1 h-full text-gray-900 dark:text-gray-100">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}