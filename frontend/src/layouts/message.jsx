import React, { useState, useRef, useEffect } from 'react';
import { FaBell, FaEnvelope, FaUser } from 'react-icons/fa';
import { ChevronDown } from 'lucide-react';

// Composant Dropdown amélioré avec filtres
const Dropdown = ({ ref, show, setShow, icon, label, items, noScroll, onFilterChange, activeFilter }) => {
  const [filter, setFilter] = useState('all');

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    if (onFilterChange) {
      onFilterChange(newFilter);
    }
  };

  if (!show) return null;

  return (
    <div
      className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
    >
      {/* Header avec filtres */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-medium text-gray-900 dark:text-white mb-2">{label}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => handleFilterChange('all')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              filter === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Tout ({items.length})
          </button>
          <button
            onClick={() => handleFilterChange('unread')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              filter === 'unread'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Non lus ({items.filter(item => !item.read).length})
          </button>
        </div>
      </div>

      {/* Liste des éléments */}
      <div className="max-h-64 overflow-y-auto">
        {items
          .filter(item => filter === 'all' || (filter === 'unread' && !item.read))
          .map((item, index) => (
            <div
              key={index}
              className={`p-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                !item.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {item.from && (
                    <p className="font-medium text-sm text-gray-900 dark:text-white">
                      {item.from}
                    </p>
                  )}
                  <p className={`text-sm mt-1 ${
                    !item.read 
                      ? 'text-gray-900 dark:text-white font-medium' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {item.text || item.message}
                  </p>
                  {item.time && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {item.time}
                    </p>
                  )}
                </div>
                {!item.read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2 mt-1"></div>
                )}
              </div>
            </div>
          ))}
        
        {items.filter(item => filter === 'all' || (filter === 'unread' && !item.read)).length === 0 && (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            {filter === 'unread' ? 'Aucun élément non lu' : 'Aucun élément'}
          </div>
        )}
      </div>
    </div>
  );
};

const MessageComponent = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const notifRef = useRef(null);
  const msgRef = useRef(null);
  const profileRef = useRef(null);

  // Données d'exemple avec statut de lecture
  const messages = [
    { from: "Alice", text: "Bonjour, j'ai une question sur l'événement.", read: false, time: "Il y a 5 min" },
    { from: "Bob", text: "Le planning a été modifié.", read: true, time: "Il y a 1h" },
    { from: "Charlie", text: "Merci pour la confirmation.", read: false, time: "Il y a 2h" },
    { from: "David", text: "Pouvez-vous vérifier les documents ?", read: true, time: "Hier" },
  ];

  const notifications = [
    { message: "Nouveau commentaire sur votre publication", read: false, time: "Il y a 2 min" },
    { message: "Votre rapport a été approuvé", read: true, time: "Il y a 30 min" },
    { message: "Réunion dans 15 minutes", read: false, time: "Il y a 45 min" },
    { message: "Mise à jour système terminée", read: true, time: "Il y a 2h" },
  ];

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Fermer les dropdowns quand on clique ailleurs
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

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <header className={`${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border-b px-4 py-3`}>
        <div className="flex items-center gap-3 sm:gap-6 relative justify-end">
          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative p-2 rounded-full transition-all duration-200 ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
              aria-label="Notifications"
            >
              <FaBell className="text-lg sm:text-xl" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>
            <Dropdown
              ref={notifRef}
              show={showNotifications}
              setShow={setShowNotifications}
              label="Notifications"
              items={notifications}
              noScroll={true}
            />
          </div>

          {/* Messages */}
          <div ref={msgRef} className="relative">
            <button
              onClick={() => setShowMessages(!showMessages)}
              className={`relative p-2 rounded-full transition-all duration-200 ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
              aria-label="Messages"
            >
              <FaEnvelope className="text-lg sm:text-xl" />
              {messages.filter(m => !m.read).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {messages.filter(m => !m.read).length}
                </span>
              )}
            </button>
            <Dropdown
              ref={msgRef}
              show={showMessages}
              setShow={setShowMessages}
              label="Messages"
              items={messages}
              noScroll={true}
            />
          </div>

          {/* Profil */}
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
                className={`absolute mt-2 w-48 rounded-lg shadow-lg border ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                } z-50 transition-all duration-200 right-0`}
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

          {/* Toggle Dark Mode */}
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

      {/* Contenu principal pour demo */}
      <main className="p-6">
        <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Dashboard
        </h1>
        <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Cliquez sur les icônes de notification et de message pour voir les filtres "Tout" et "Non lus".
        </p>
      </main>
    </div>
  );
};

export default MessageComponent;