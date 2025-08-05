import React, { useState, useEffect, useRef } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  FaCogs,
  FaUsers,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaMoon,
  FaSun,
  FaUser,
  // FaUserCircle
} from "react-icons/fa";
import { FaBell, FaEnvelope } from "react-icons/fa6";

import { FiLayout } from "react-icons/fi";
import { ChevronDown } from "lucide-react";
import { MdCalendarToday, MdHistory, MdQueryStats, MdRoom } from "react-icons/md";
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
    { path: "/AdminHistorique", name: "Historique d'activité", icon: <MdHistory className="text-lg" /> },
    { path: "/AdminStats", name: "Statistique", icon: <MdQueryStats className="text-lg" /> },
    { path: "/AdminParametre", name: "Paramètres", icon: <FaCogs className="text-lg" /> },
  ];

  const handleLogout = () => {
    console.log("Déconnexion");
  };

  const gradientTitle =
    "bg-gradient-to-r from-blue-500 via-violet-500 to-purple-300 bg-clip-text text-transparent";
  const gradientButton =
    "bg-gradient-to-r from-blue-500 via-violet-500 to-purple-400 text-white";

  const bgClass = darkMode
    ? "bg-gray-900 text-gray-200"
    : "bg-gradient-to-r from-white to-gray-50 text-gray-800";

  const currentPage = menuItems.find(item => item.path === location.pathname);
  const currentPageName = currentPage ? currentPage.name : "Page Inconnue";
  const currentPageIcon = currentPage ? currentPage.icon : null;

  const Dropdown = React.forwardRef(({ show, setShow, icon, label, count, items }, ref) => {
    const { darkMode } = useDarkMode();
    const [isMobile, setIsMobile] = useState(false);
  
    useEffect(() => {
      const checkMobile = () => setIsMobile(window.innerWidth < 640);
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }, []);
  
    return (
      <div className="relative" ref={ref}>
        <button
          onClick={() => setShow(!show)}
          className={`relative p-2 rounded-full transition-all duration-200 ${
            darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
          }`}
          aria-label={label}
        >
          <div className="relative">
            {React.cloneElement(icon, { className: 'w-5 h-5' })}
            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </div>
        </button>
        
        {show && (
          <div
            className={`fixed sm:absolute mt-2 w-[calc(100vw-2rem)] sm:w-80 max-h-[70vh] overflow-y-auto rounded-xl shadow-xl border ${
              darkMode 
                ? 'bg-gray-800 border-gray-700 text-gray-200' 
                : 'bg-white border-gray-200 text-gray-900'
            } z-50 transition-all duration-200 ${
              isMobile ? 'left-4 right-4' : 'right-0'
            }`}
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
              {React.cloneElement(icon, { className: 'w-5 h-5' })}
              <h4 className={`font-semibold text-sm sm:text-base ${
                darkMode ? "text-purple-300" : "text-purple-600"  // Changé en violet
              }`}>{label}</h4>
              {count > 0 && (
                <span className="ml-auto bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </div>
            
            <div className="max-h-[60vh] overflow-y-auto">
              {items.length ? (
                items.map((item, i) => (
                  <div
                    key={i}
                    className={`p-3 transition-colors duration-150 border-b ${
                      darkMode 
                        ? 'border-gray-700 hover:bg-gray-700' 
                        : 'border-gray-200 hover:bg-gray-50'
                    } cursor-pointer`}
                  >
                    <p className="text-sm line-clamp-2">
                      {typeof item === 'object' ? `${item.from}: ${item.text}` : item}
                    </p>
                    <p className={`text-xs mt-1 ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Il y a {Math.floor(Math.random() * 60)} min
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center">
                  <p className={`text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Aucun {label.toLowerCase()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  });

  const AdminHeader = ({ currentPageName, darkMode }) => {

    const [showNotifications, setShowNotifications] = useState(false);
    const [showMessages, setShowMessages] = useState(false);
    const [showProfile, setShowProfile] = useState(false);

    const notifRef = useRef(null);
    const msgRef = useRef(null);
    const profileRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (notifRef.current && !notifRef.current.contains(event.target)) {
          setShowNotifications(false);
        }
        if (msgRef.current && !msgRef.current.contains(event.target)) {
          setShowMessages(false);
        }
        if (profileRef.current && !profileRef.current.contains(event.target)) {
          setShowProfile(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    const notifications = [
      "Nouvel organisateur inscrit",
      "Événement 'Conférence Tech' mis à jour",
      "Paiement reçu pour 'Atelier React'",
      "Nouveau message de support",
    ];

    const messages = [
      { from: "Alice", text: "Bonjour, j'ai une question sur l'événement." },
      { from: "Bob", text: "Le planning a été modifié." },
      { from: "Charlie", text: "Merci pour la confirmation." },
    ];

    const pageBg = darkMode
      ? "bg-gray-900 text-gray-200"
      : "bg-gray-50 text-gray-800";

    return (
      <header className={`flex flex-col md:flex-row justify-between items-center gap-4 pt-8 pl-8 pr-8 ${pageBg}`}
      >
        <h2 className={`text-2xl sm:text-3xl font-bold flex items-center ${gradientTitle}`}>
          {currentPageIcon && <span className="mr-2 sm:mr-3 text-blue-700">{currentPageIcon}</span>}
          {currentPageName}
        </h2>
        <div className="flex items-center gap-3 sm:gap-6 relative">
          <Dropdown
            ref={notifRef}
            show={showNotifications}
            setShow={setShowNotifications}
            icon={<FaBell className="text-lg sm:text-xl" />}
            label="Notifications"
            count={notifications.length}
            items={notifications}
            noScroll={true}
          />

          <Dropdown
            ref={msgRef}
            show={showMessages}
            setShow={setShowMessages}
            icon={<FaEnvelope className="text-lg sm:text-xl" />}
            label="Messages"
            count={messages.length}
            items={messages.map((msg) => `${msg.from} : ${msg.text}`)}
            noScroll={true}
          />

          <div ref={profileRef} className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className={`flex items-center gap-2 p-2 rounded-full transition-all duration-200 ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
              aria-label="Menu profil"
            >
              <div className="relative">
                <FaUser className="w-5 h-5" />
              </div>
              <span className="hidden sm:inline text-sm font-medium">Admin</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                showProfile ? 'rotate-180' : ''
              }`} />
            </button>
            {showProfile && (
              <div
                className={`fixed sm:absolute mt-2 w-[calc(100vw-2rem)] sm:w-48 rounded-lg shadow-lg border ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                } z-50 transition-all duration-200 ${
                  window.innerWidth < 640 ? 'left-4 right-4' : 'right-0'
                }`}
              >
                <div className="p-2">
                  <div className={`px-3 py-2 text-sm ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <p className="font-medium">Connecté en tant que</p>
                    <p className="truncate">admin@example.com</p>
                  </div>
                  <div className={`border-t ${
                    darkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}></div>
                  <button
                    className={`w-full text-left px-3 py-2 text-sm ${
                      darkMode 
                        ? 'hover:bg-gray-700 text-gray-200' 
                        : 'hover:bg-gray-100 text-gray-800'
                    } transition-colors duration-150`}
                  >
                    Mon profil
                  </button>
                  <button
                    className={`w-full text-left px-3 py-2 text-sm ${
                      darkMode 
                        ? 'hover:bg-gray-700 text-gray-200' 
                        : 'hover:bg-gray-100 text-gray-800'
                    } transition-colors duration-150`}
                  >
                    Paramètres
                  </button>
                  <div className={`border-t ${
                    darkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}></div>
                  <button
                    className={`w-full text-left px-3 py-2 text-sm ${
                      darkMode 
                        ? 'hover:bg-gray-700 text-red-400' 
                        : 'hover:bg-gray-100 text-red-600'
                    } transition-colors duration-150`}
                  >
                    Déconnexion
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full ${
              darkMode 
                ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            } transition-colors duration-200`}
            aria-label="Toggle dark mode"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </header>
    );
  };

  return (
    <div className={`flex h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      {/* Overlay pour mobile */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black opacity-50 z-40"
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
        <AdminHeader currentPageName={currentPageName} darkMode={darkMode} />
        <main className="flex-1 overflow-auto scrollable p-0 bg-gray-50 dark:bg-gray-900">
          <div className={`h-full ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}