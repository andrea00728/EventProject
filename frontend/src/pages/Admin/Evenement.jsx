import React, { useEffect, useState, useRef, useMemo } from "react";
import { useDarkMode } from "../../context/DarkModeContext";
import ModalEvenement from "./ModalEvenement";
// import { Evenement } from 'backend/src/entities/Evenement';
// import { EvenementService } from 'backend/src/services/evenement/evenement.service';
import { getAllEvents } from "../../services/evenementServ";
import { FaEye, FaUser, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
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
      case "visibilite":
        value = event.isPublic ? 'public' : 'privé';
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
        Visibilité: value.isPublic ? 'Public' : 'Privé',
        Date_debut: value.date,
        Date_fin: value.date_fin,
        Localisation: value.location.nom,
        Organisateur: value.user.name,
        Statut: value.status === 'active' ? 'Actif' : 'Inactif',
        Participants: value.participants || 0
      })
    );
    handleDownloadXLSX(page, "liste_evenements");
  };
  // Statistiques
  // Statistiques
  const stats = useMemo(() => {
    const total = data.length;
    const active = data.filter(e => e.status === 'active').length;
    const publicEvents = data.filter(e => e.isPublic === true).length;
    const privateEvents = data.filter(e => e.isPublic === false).length;
    const totalParticipants = data.reduce((sum, e) => sum + (e.participants || 0), 0);
    const avgParticipants = total > 0 ? Math.round(totalParticipants / total) : 0;

    return {
      total,
      active,
      publicEvents,
      privateEvents,
      totalParticipants,
      avgParticipants
    };
  }, [data]);

  const gradientTitle =
    "bg-gradient-to-r from-blue-500 via-violet-500 to-purple-300 bg-clip-text text-transparent";
  const gradientButton =
    "bg-gradient-to-r from-blue-500 via-violet-500 to-purple-400 text-white";

  const gradientsEvent = {
    eventButton: "bg-gradient-to-r from-indigo-600 via-blue-500 to-indigo-700 text-white"
  };

  const pageBg = darkMode
    ? "bg-gray-900 text-gray-200"
    : "bg-gradient-to-r from-white to-gray-50 text-gray-800";

  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const tableContainerClasses = `hidden md:block rounded-xl shadow-lg border transition-colors duration-300 ${
    darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
  }`;

  const headerClasses = `grid grid-cols-12 gap-4 px-6 py-4 font-bold uppercase text-xs border-b transition-colors duration-300 ${
    darkMode ? "bg-gray-800 border-gray-700 text-gray-300" : "bg-gray-50 border-gray-200 text-gray-600"
  }`;

  const rowClasses = `grid grid-cols-12 gap-4 px-6 py-4 items-center border-b transition-colors duration-150 ${
    darkMode ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-100"
  }`;

  const paginationClasses = `px-6 py-4 flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 text-sm border-t transition-colors duration-300 ${
    darkMode ? "border-gray-700 bg-gray-800 text-gray-300" : "border-gray-200 bg-gray-50 text-gray-600"
  }`;
  
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const textBlue = darkMode ? "text-blue-300" : "text-blue-600";
  const textPurple = darkMode ? "text-purple-300" : "text-purple-600";
  const activeStatusClasses = darkMode ? "bg-green-900/50 text-green-300" : "bg-green-100 text-green-800";
  const inactiveStatusClasses = darkMode ? "bg-gray-700/50 text-gray-400" : "bg-gray-100 text-gray-600";

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const onSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    let sortableItems = [...filteredData];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          // Tri alphabétique pour les chaînes de caractères
          if (aValue.toLowerCase() < bValue.toLowerCase()) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (aValue.toLowerCase() > bValue.toLowerCase()) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          // Tri numérique
          if (aValue < bValue) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
        } else if (sortConfig.key === 'date') {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
        }

        return 0;
      });
    }
    return sortableItems;
  }, [filteredData, sortConfig]);


  return (
    <div className={`min-h-100vh p-4 sm:p-6 md:p-8 w-full mx-auto transition duration-500 ${pageBg}`}>

      {/* Section Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Événements"
          value={stats.total}
          icon={MdEvent}
          trend={12}
          color="blue"
        />
        {/* <StatsCard
          title="Événements Actifs"
          value={stats.active}
          icon={MdCalendarToday}
          trend={8}
          color="green"
        /> */}
        <StatsCard
          title="Événements Publics"
          value={stats.publicEvents}
          icon={MdPeople}
          trend={5}
          color="purple"
        />
        <StatsCard
          title="Événements Privés"
          value={stats.privateEvents}
          icon={MdLocationOn}
          trend={3}
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
              gradientButton
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
            <p className={`text-lg ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
              {error}
            </p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-12">
            <MdCalendarToday className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className={`text-lg ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>
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
                    participants: event.participants || 0,
                  }}
                  darkMode={darkMode}
                  onViewDetails={openModal}
                />
              ))}
            </div>

            {/* Version desktop - DataGrid */}
            <div className={tableContainerClasses}>
              {/* En-têtes du tableau avec filtres de tri */}
              <div className={`rounded-t-xl ${headerClasses}`}>
                <button onClick={() => onSort('nom')} className="col-span-3 flex items-center gap-2">
                  ÉVÉNEMENT
                  {sortConfig.key === 'nom' ? (
                    sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                  ) : (
                    <FaSort className="opacity-50" />
                  )}
                </button>
                <button onClick={() => onSort('type')} className="col-span-1 flex items-center gap-2">
                  TYPE
                  {sortConfig.key === 'type' ? (
                    sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                  ) : (
                    <FaSort className="opacity-50" />
                  )}
                </button>
                <button onClick={() => onSort('theme')} className="col-span-2 flex items-center gap-2">
                  THÈME
                  {sortConfig.key === 'theme' ? (
                    sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                  ) : (
                    <FaSort className="opacity-50" />
                  )}
                </button>
                <div className="col-span-1">ÉVÉNEMENT ORGANISE</div>
                <button onClick={() => onSort('date')} className="col-span-2 flex items-center gap-2">
                  DATE DÉBUT
                  {sortConfig.key === 'date' ? (
                    sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                  ) : (
                    <FaSort className="opacity-50" />
                  )}
                </button>
                <button onClick={() => onSort('invites')} className="col-span-1 text-center flex items-center justify-center gap-2">
                  PARTICIPANTS
                  {sortConfig.key === 'invites' ? (
                    sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                  ) : (
                    <FaSort className="opacity-50" />
                  )}
                </button>
                <div className="col-span-2 text-center">ACTIONS</div>
              </div>

              {/* Contenu du tableau */}
              <div
                className="divide-y transition-colors duration-300"
                style={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}
              >
                {sortedData.length > 0 ? (
                  sortedData
                    .slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage)
                    .map((event, index) => (
                      <div key={index} className={rowClasses}>
                        {/* Nom Événement */}
                        <div className={`col-span-3 font-medium truncate ${textBlue}`}>
                          {event.nom}
                        </div>
                        {/* Type */}
                        <div className="col-span-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${darkMode ? 'bg-gray-700 text-blue-300' : 'bg-blue-50 text-blue-600'}`}>
                            {event.type}
                          </span>
                        </div>
                        {/* Thème */}
                        <div className={`col-span-2 truncate ${textPurple}`}>
                          {event.theme}
                        </div>
                        {/* Visibilité */}
                        <div className="col-span-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${event.isPublic ? (darkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800') : (darkMode ? 'bg-gray-700/50 text-gray-400' : 'bg-gray-100 text-gray-600')}`}>
                            {event.isPublic ? 'Public' : 'Privé'}
                          </span>
                        </div>
                        {/* Date Début */}
                        <div className={`col-span-2 text-sm ${textMuted}`}>
                          {formatDate(event.date)}
                        </div>
                        {/* Participants */}
                        <div className="col-span-1 flex items-center justify-center">
                          <div className={`flex items-center gap-1 ${textBlue}`}>
                            <MdPeople className="text-lg" />
                            <span>{event.invites.length || 0}</span>
                          </div>
                        </div>
                        {/* Bouton d'action */}
                        <div className="col-span-2 flex items-center justify-center">
                          <button
                            onClick={() => openModal(index)}
                            className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-all duration-200 shadow-sm hover:shadow-md ${gradientsEvent.eventButton}`}
                          >
                            <FaEye className="text-sm" />
                            <span>Détails</span>
                          </button>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className={`px-6 py-8 text-center text-lg font-medium ${textMuted}`}>
                    Aucun événement trouvé
                  </div>
                )}
              </div>

              {/* Pagination */}
              {sortedData.length > 0 && (
                <div className={`rounded-b-xl ${paginationClasses}`}>
                  <div className="flex items-center space-x-2">
                    <span className={textMuted}>Lignes par page:</span>
                    <select
                      value={rowsPerPage}
                      onChange={(e) => {
                        setRowsPerPage(Number(e.target.value));
                        setCurrentPage(0);
                      }}
                      className={`border rounded px-2 py-1 transition-colors duration-200 ${darkMode ? "bg-gray-700 border-gray-600 text-gray-200" : "bg-white border-gray-300 text-gray-800"}`}
                    >
                      {[5, 10, 20, 50].map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  <div className={textMuted}>
                    Affichage de {(currentPage * rowsPerPage) + 1} à {Math.min((currentPage + 1) * rowsPerPage, sortedData.length)} sur {sortedData.length} événements
                  </div>
                  <div className="flex space-x-2">
                    <button
                      className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${darkMode ? "border-gray-600 hover:bg-gray-700 disabled:bg-gray-800" : "border-gray-300 hover:bg-gray-100 disabled:bg-gray-50"} disabled:opacity-50`}
                      disabled={currentPage === 0}
                      onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                    >
                      Précédent
                    </button>
                    <button
                      className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${darkMode ? "border-gray-600 hover:bg-gray-700 disabled:bg-gray-800" : "border-gray-300 hover:bg-gray-100 disabled:bg-gray-50"} disabled:opacity-50`}
                      disabled={(currentPage + 1) * rowsPerPage >= sortedData.length}
                      onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              )}
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