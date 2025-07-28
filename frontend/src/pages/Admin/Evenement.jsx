import React, { useEffect, useState, useRef, useMemo } from "react";
import { useDarkMode } from "../../context/DarkModeContext";
import ModalEvenement from "./ModalEvenement";
import { getAllEvents } from "../../services/evenementServ";
import { FaEye, FaUser } from "react-icons/fa";
import {
  MdCalendarToday,
  MdFileDownload,
  MdSearch,
  MdFilterList,
  MdPeople,
  MdEvent,
  MdLocationOn,
  MdTrendingUp
} from "react-icons/md";
import { handleDownloadXLSX } from "../../services/downloadXLSX";
import { DataGrid } from "@mui/x-data-grid";
import { FaBell, FaEnvelope } from "react-icons/fa6";
import { ChevronDown } from "lucide-react";

// Helper function to format date
export const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

// Composant StatsCard
const StatsCard = ({ title, value, icon: Icon, trend, color = "blue" }) => {
  const { darkMode } = useDarkMode();
  
  const colors = {
    blue: { bg: "from-blue-500 to-cyan-500", text: "text-blue-500" },
    green: { bg: "from-green-500 to-emerald-500", text: "text-green-500" },
    purple: { bg: "from-purple-500 to-pink-500", text: "text-purple-500" },
    orange: { bg: "from-orange-500 to-yellow-500", text: "text-orange-500" }
  };

  return (
    <div className={`rounded-xl p-4 shadow-sm border ${
      darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
    } relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${
        colors[color].bg
      } opacity-10 rounded-full -mr-4 -mt-4`} />
      
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${
            darkMode ? "text-blue-300" : "text-blue-600"  // Changé en bleu clair
          } mb-1`}>{title}</p>
          <p className={`text-2xl font-bold ${
            darkMode ? "text-white" : "text-gray-900"
          }`}>{value}</p>
          {trend && (
            <div className="flex items-center mt-1">
              <MdTrendingUp className={`mr-1 ${
                trend > 0 ? "text-green-500" : "text-red-500"
              }`} />
              <span className={`text-sm ${
                trend > 0 ? "text-green-600" : "text-red-600"
              }`}>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full bg-gradient-to-br ${
          colors[color].bg
        } text-white`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

// Composant Dropdown responsive
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

// Composant EventCard pour l'affichage mobile
const EventCard = ({ event, darkMode, onViewDetails }) => {
  return (
    <div className={`p-4 mb-4 rounded-xl shadow-sm border transition-all duration-300 ${
      darkMode ? "bg-gray-800 border-gray-700 hover:border-gray-600" : "bg-white border-gray-200 hover:border-gray-300"
    }`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className={`text-lg font-semibold ${
          darkMode ? "text-blue-300" : "text-blue-600"  // Changé en bleu clair
        }`}>
          {event.nom}
        </h3>
        <span className={`px-2 py-1 rounded-full text-xs ${
          event.status === 'active'
            ? darkMode
              ? 'bg-green-900/50 text-green-300'
              : 'bg-green-100 text-green-800'
            : darkMode
              ? 'bg-gray-700/50 text-gray-400'
              : 'bg-gray-100 text-gray-600'
        }`}>
          {event.status === 'active' ? 'Actif' : 'Inactif'}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="flex items-center gap-2">
          <MdEvent className={`text-sm ${
            darkMode ? "text-blue-400" : "text-blue-600"
          }`} />
          <span className={`text-sm ${
            darkMode ? "text-gray-300" : "text-gray-600"
          }`}>
            {event.type}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <MdPeople className={`text-sm ${
            darkMode ? "text-purple-400" : "text-purple-600"
          }`} />
          <span className={`text-sm ${
            darkMode ? "text-gray-300" : "text-gray-600"
          }`}>
            {event.participants || 0} participants
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <MdCalendarToday className={`text-sm ${
            darkMode ? "text-cyan-400" : "text-cyan-600"
          }`} />
          <span className={`text-sm ${
            darkMode ? "text-gray-300" : "text-gray-600"
          }`}>
            {event.date.split(' ')[0]}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <MdLocationOn className={`text-sm ${
            darkMode ? "text-orange-400" : "text-orange-600"
          }`} />
          <span className={`text-sm ${
            darkMode ? "text-gray-300" : "text-gray-600"
          }`}>
            {event.localisation}
          </span>
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-3">
        <div>
          <p className={`text-xs ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}>
            Organisé par
          </p>
          <p className={`text-sm ${
            darkMode ? "text-gray-200" : "text-gray-700"
          }`}>
            {event.organisateur}
          </p>
        </div>
        
        <button
          onClick={() => onViewDetails(event.action)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm ${
            darkMode
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          } transition-colors duration-200`}
        >
          <FaEye className="text-sm" />
          <span>Détails</span>
        </button>
      </div>
    </div>
  );
};

export default function EvenementAd() {
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const { darkMode, toggleDarkMode } = useDarkMode();

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

  // Filtrage dynamique
  const [filterField, setFilterField] = useState("nom");
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllEvents();
        setData(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des événements : ", error);
        setError("Impossible de charger les événements.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const openModal = (key) => {
    setModalData(data[key]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setModalData({});
    setIsModalOpen(false);
  };

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

  const filteredData = data.filter((event) => {
    let value = "";
    switch (filterField) {
      case "nom":
        value = event.nom;
        break;
      case "type":
        value = event.type;
        break;
      case "theme":
        value = event.theme;
        break;
      case "localisation":
        value = event.location.nom;
        break;
      case "organisateur":
        value = event.user.name;
        break;
      default:
        value = "";
    }
    return value.toLowerCase().includes(searchValue.toLowerCase());
  });

  const handleExportExcel = () => {
    const page = (filteredData.length === 0 ? data : filteredData).map(
      (value) => ({
        Nom: value.nom,
        Type: value.type,
        Theme: value.theme,
        Date_debut: value.date,
        Date_fin: value.date_fin,
        Localisation: value.location.nom,
        Organisateur: value.user.name,
      })
    );
    handleDownloadXLSX(page, "liste_evenements");
  };

  // Statistiques
  const stats = useMemo(() => {
    const total = data.length;
    const active = data.filter(e => e.status === 'active').length;
    const totalParticipants = data.reduce((sum, e) => sum + (e.participants || 0), 0);
    const avgParticipants = total > 0 ? Math.round(totalParticipants / total) : 0;

    return {
      total,
      active,
      totalParticipants,
      avgParticipants
    };
  }, [data]);

  const pageBg = darkMode
    ? "bg-gray-900 text-gray-200"
    : "bg-gradient-to-r from-white to-gray-50 text-gray-800";

  return (
    <div className={`min-h-screen p-4 sm:p-6 md:p-8 w-full mx-auto transition duration-500 ${pageBg}`}>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className={`text-2xl sm:text-3xl font-bold flex items-center ${
          darkMode 
            ? 'text-blue-300'  // Bleu clair en mode nuit
            : 'bg-gradient-to-r from-blue-500 via-violet-500 to-purple-300 bg-clip-text text-transparent'
        }`}>
          <MdCalendarToday className="mr-3" /> Liste des événements
        </h2>

        <div className="flex items-center gap-2 sm:gap-4">
          <Dropdown
            ref={notifRef}
            show={showNotifications}
            setShow={setShowNotifications}
            icon={<FaBell />}
            label="Notifications"
            count={notifications.length}
            items={notifications}
          />

          <Dropdown
            ref={msgRef}
            show={showMessages}
            setShow={setShowMessages}
            icon={<FaEnvelope />}
            label="Messages"
            count={messages.length}
            items={messages}
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
              <span className={`hidden sm:inline text-sm font-medium ${
                darkMode ? "text-purple-300" : "text-purple-600"  // Violet
              }`}>Admin</span>
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
      </div>

      {/* Section Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Événements"
          value={stats.total}
          icon={MdEvent}
          trend={12}
          color="blue"
        />
        <StatsCard
          title="Événements Actifs"
          value={stats.active}
          icon={MdCalendarToday}
          trend={8}
          color="green"
        />
        <StatsCard
          title="Total Participants"
          value={stats.totalParticipants.toLocaleString()}
          icon={MdPeople}
          trend={-3}
          color="purple"
        />
        <StatsCard
          title="Moyenne Participants"
          value={stats.avgParticipants}
          icon={MdLocationOn}
          trend={5}
          color="orange"
        />
      </div>

      {/* Filtrage dynamique amélioré */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        {/* Conteneur pour les éléments de filtre (select + input) */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className={`flex items-center gap-2 px-5 py-0.5 rounded-lg ${
            darkMode ? 'bg-gray-800' : 'bg-gray-100'
          }`}>
            <MdFilterList className="text-gray-500" />
            <select
              className={`p-2 bg-transparent focus:outline-none ${
                darkMode ? 'text-blue-300' : 'text-blue-600'  // Bleu clair
              }`}
              value={filterField}
              onChange={(e) => setFilterField(e.target.value)}
            >
              <option value="nom">Nom</option>
              <option value="type">Type</option>
              <option value="theme">Thème</option>
              <option value="localisation">Localisation</option>
              <option value="organisateur">Organisateur</option>
            </select>
          </div>
          
          <div className={`relative w-full sm:w-64 flex items-center ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } rounded-lg shadow-sm border ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <MdSearch className="absolute left-3 text-gray-400" />
            <input
              type="text"
              placeholder={`Rechercher par ${filterField}...`}
              className={`w-full pl-10 pr-4 py-2 bg-transparent focus:outline-none ${
                darkMode ? 'text-blue-300 placeholder-gray-400' : 'text-blue-600 placeholder-gray-500'  // Bleu clair
              }`}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
        </div>

        {/* Bouton d'export avec marge à gauche sur desktop */}
        <div className="w-full sm:w-auto sm:ml-auto">
          <button
            onClick={handleExportExcel}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl w-full ${
              darkMode 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            } transition-colors duration-200 shadow-md hover:shadow-lg`}
          >
            <MdFileDownload className="text-lg" />
            <span>Exporter en CSV</span>
          </button>
        </div>
      </div>

      <div className="p-4 overflow-auto">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className={`text-lg ${
              darkMode ? 'text-red-400' : 'text-red-600'
            }`}>{error}</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-12">
            <MdCalendarToday className={`w-16 h-16 mx-auto mb-4 ${
              darkMode ? 'text-gray-600' : 'text-gray-300'
            }`} />
            <p className={`text-lg ${
              darkMode ? 'text-purple-300' : 'text-purple-600'  // Violet
            }`}>
              Aucun événement trouvé
            </p>
          </div>
        ) : (
          <>
            {/* Version mobile - Cards */}
            <div className="block md:hidden space-y-4">
              {filteredData.map((event, index) => (
                <EventCard 
                  key={index}
                  event={{
                    ...event,
                    action: index,
                    date: formatDate(event.date),
                    localisation: event.location.nom,
                    organisateur: event.user.name,
                    status: event.status,
                    participants: event.participants || 0
                  }}
                  darkMode={darkMode}
                  onViewDetails={openModal}
                />
              ))}
            </div>

            {/* Version desktop - DataGrid */}
            <div className="hidden md:block h-[auto] w-full overflow-hidden rounded-xl shadow-sm">
              <DataGrid
                rows={filteredData.map((event, index) => ({
                  id: index,
                  nom: event.nom,
                  type: event.type,
                  theme: event.theme,
                  date: formatDate(event.date),
                  date_fin: formatDate(event.date_fin),
                  localisation: event.location.nom,
                  organisateur: event.user.name,
                  participants: event.participants || 0,
                  status: event.status,
                  action: index,
                }))}
                columns={[
                  { 
                    field: "nom", 
                    headerName: "ÉVÉNEMENT", 
                    flex: 1.5,
                    renderCell: (params) => (
                      <div className={`font-medium ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                        {params.value}
                      </div>
                    )
                  },
                  { 
                    field: "type", 
                    headerName: "TYPE", 
                    flex: 1,
                    renderCell: (params) => (
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        darkMode 
                          ? 'bg-gray-700 text-blue-300' 
                          : 'bg-blue-50 text-blue-600'
                      }`}>
                        {params.value}
                      </span>
                    )
                  },
                  { 
                    field: "theme", 
                    headerName: "THÈME", 
                    flex: 1,
                    renderCell: (params) => (
                      <span className={`truncate ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>
                        {params.value}
                      </span>
                    )
                  },
                  { 
                    field: "date", 
                    headerName: "DATE DÉBUT", 
                    flex: 1,
                    renderCell: (params) => (
                      <div className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                        {params.value}
                      </div>
                    )
                  },
                  { 
                    field: "participants", 
                    headerName: "PARTICIPANTS", 
                    width: 140,
                    headerAlign: 'center',
                    align: 'center',
                    renderCell: (params) => (
                      <div className={`flex items-center justify-center gap-1 ${
                        darkMode ? 'text-blue-300' : 'text-blue-600'
                      }`}>
                        <MdPeople className="text-lg" />
                        <span>{params.value}</span>
                      </div>
                    )
                  },
                  { 
                    field: "status", 
                    headerName: "STATUT", 
                    width: 120,
                    renderCell: (params) => (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        params.value === 'active'
                          ? darkMode
                            ? 'bg-green-900/50 text-green-300'
                            : 'bg-green-100 text-green-800'
                          : darkMode
                            ? 'bg-gray-700/50 text-gray-400'
                            : 'bg-gray-100 text-gray-600'
                      }`}>
                        {params.value === 'active' ? 'Actif' : 'Inactif'}
                      </span>
                    )
                  },
                  {
                    field: "action",
                    headerName: "",
                    width: 120,
                    sortable: false,
                    filterable: false,
                    disableColumnMenu: true,
                    renderCell: (params) => (
                      <button
                        onClick={() => openModal(params.value)}
                        className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-sm ${
                          darkMode
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        } transition-colors duration-200`}
                      >
                        <FaEye className="text-sm" />
                        <span>Détails</span>
                      </button>
                    ),
                  },
                ]}
                pageSize={10}
                rowsPerPageOptions={[5, 10, 20]}
                disableSelectionOnClick
                disableRowSelectionOnClick
                checkboxSelection={false}
                autoHeight
                sx={{
                  '& .MuiDataGrid-root': {
                    border: 'none',
                    fontFamily: 'inherit',
                  },
                  '& .MuiDataGrid-cell': {
                    borderBottom: darkMode 
                      ? '1px solid rgba(31, 41, 55, 0.5)' 
                      : '1px solid rgba(226, 232, 240, 0.8)',
                    '&:focus': {
                      outline: 'none',
                    },
                  },
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: darkMode ? 'rgb(17, 24, 39)' : 'rgb(248, 250, 252)',
                    borderBottom: darkMode 
                      ? '1px solid rgba(31, 41, 55, 0.8)' 
                      : '1px solid rgba(226, 232, 240, 0.8)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: darkMode ? 'rgb(156, 163, 175)' : 'rgb(71, 85, 105)',
                  },
                  '& .MuiDataGrid-columnHeader': {
                    '&:focus': {
                      outline: 'none',
                    },
                  },
                  '& .MuiDataGrid-footerContainer': {
                    backgroundColor: darkMode ? 'rgb(17, 24, 39)' : 'rgb(248, 250, 252)',
                    borderTop: darkMode 
                      ? '1px solid rgba(31, 41, 55, 0.8)' 
                      : '1px solid rgba(226, 232, 240, 0.8)',
                  },
                  '& .MuiDataGrid-row': {
                    backgroundColor: darkMode ? 'rgb(31, 41, 55)' : 'rgb(255, 255, 255)',
                    '&:hover': {
                      backgroundColor: darkMode 
                        ? 'rgba(55, 65, 81, 0.4)' 
                        : 'rgba(241, 245, 249, 0.8)',
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'transparent',
                      '&:hover': {
                        backgroundColor: darkMode 
                          ? 'rgba(55, 65, 81, 0.4)' 
                          : 'rgba(241, 245, 249, 0.8)',
                      },
                    },
                  },
                  '& .MuiTablePagination-root': {
                    color: darkMode ? 'rgb(156, 163, 175)' : 'rgb(71, 85, 105)',
                  },
                  '& .MuiDataGrid-virtualScroller': {
                    scrollbarWidth: 'thin',
                    '&::-webkit-scrollbar': {
                      height: '8px',
                      width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: darkMode ? 'rgb(31, 41, 55)' : 'rgb(241, 245, 249)',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: darkMode ? 'rgb(75, 85, 99)' : 'rgb(203, 213, 225)',
                      borderRadius: '4px',
                      '&:hover': {
                        background: darkMode ? 'rgb(107, 114, 128)' : 'rgb(148, 163, 184)',
                      },
                    },
                  },
                  '& .MuiDataGrid-menuIcon': {
                    color: darkMode ? 'rgb(156, 163, 175)' : 'rgb(71, 85, 105)',
                  },
                  '& .MuiDataGrid-sortIcon': {
                    color: darkMode ? 'rgb(156, 163, 175)' : 'rgb(71, 85, 105)',
                  },
                  '& .MuiDataGrid-iconButtonContainer': {
                    visibility: 'visible !important',
                  },
                }}
                componentsProps={{
                  pagination: {
                    sx: {
                      '& .MuiTablePagination-selectLabel': {
                        color: darkMode ? 'rgb(156, 163, 175)' : 'rgb(71, 85, 105)',
                      },
                      '& .MuiTablePagination-displayedRows': {
                        color: darkMode ? 'rgb(156, 163, 175)' : 'rgb(71, 85, 105)',
                      },
                      '& .MuiSelect-icon': {
                        color: darkMode ? 'rgb(156, 163, 175)' : 'rgb(71, 85, 105)',
                      },
                    },
                  },
                }}
                localeText={{
                  noRowsLabel: 'Aucun événement trouvé',
                  footerRowSelected: (count) =>
                    count > 1
                      ? `${count.toLocaleString()} événements sélectionnés`
                      : `${count.toLocaleString()} événement sélectionné`,
                  columnMenuSortAsc: 'Trier par ordre croissant',
                  columnMenuSortDesc: 'Trier par ordre décroissant',
                  columnMenuFilter: 'Filtrer',
                  columnMenuHideColumn: 'Masquer',
                  columnMenuManageColumns: 'Gérer les colonnes',
                  columnsPanelTextFieldLabel: 'Rechercher colonne',
                  columnsPanelTextFieldPlaceholder: 'Titre de colonne',
                  columnsPanelShowAllButton: 'Tout afficher',
                  columnsPanelHideAllButton: 'Tout masquer',
                }}
              />
            </div>
          </>
        )}
      </div>

      <ModalEvenement
        isOpen={isModalOpen}
        onClose={closeModal}
        data={modalData}
      />
    </div>
  );
}