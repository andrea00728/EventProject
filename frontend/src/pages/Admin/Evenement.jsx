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
            darkMode ? "text-gray-400" : "text-gray-600"
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
            <h4 className="font-semibold text-sm sm:text-base">{label}</h4>
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
            ? 'text-white' 
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

      <div className="flex justify-end mb-4">
        <button
          onClick={handleExportExcel}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
            darkMode 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          } transition-colors duration-200 shadow-md hover:shadow-lg`}
        >
          <MdFileDownload className="text-lg" />
          <span>Exporter en CSV</span>
        </button>
      </div>

      {/* Filtrage dynamique amélioré */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className={`flex items-center gap-2 p-2 rounded-lg ${
          darkMode ? 'bg-gray-800' : 'bg-gray-100'
        }`}>
          <MdFilterList className="text-gray-500" />
          <select
            className={`p-2 bg-transparent focus:outline-none ${
              darkMode ? 'text-gray-200' : 'text-gray-800'
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
        <div className={`relative w-full md:w-1/3 flex items-center ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        } rounded-lg shadow-sm border ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <MdSearch className="absolute left-3 text-gray-400" />
          <input
            type="text"
            placeholder={`Rechercher par ${filterField}...`}
            className={`w-full pl-10 pr-4 py-2 bg-transparent focus:outline-none ${
              darkMode ? 'text-gray-200 placeholder-gray-400' : 'text-gray-800 placeholder-gray-500'
            }`}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
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
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Aucun événement trouvé
            </p>
          </div>
        ) : (
          <div className="h-[600px] w-full overflow-auto">
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
                action: index,
              }))}
              columns={[
                { field: "nom", headerName: "Nom", flex: 1 },
                { field: "type", headerName: "Type", flex: 1 },
                { field: "theme", headerName: "Thème", flex: 1 },
                { field: "date", headerName: "Date début", flex: 1 },
                { field: "date_fin", headerName: "Date fin", flex: 1 },
                { field: "localisation", headerName: "Localisation", flex: 1 },
                { field: "organisateur", headerName: "Organisateur", flex: 1 },
                {
                  field: "action",
                  headerName: "Action",
                  flex: 1,
                  sortable: false,
                  renderCell: (params) => (
                    <button
                      onClick={() => openModal(params.value)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                        darkMode
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      } transition-colors duration-200`}
                    >
                      <FaEye />
                      <span>Voir détail</span>
                    </button>
                  ),
                },
              ]}
              pageSize={5}
              rowsPerPageOptions={[5, 10, 20]}
              disableSelectionOnClick
              autoHeight
              sx={{
                '& .MuiDataGrid-root': {
                  border: 'none',
                  color: darkMode ? '#e2e8f0' : '#1e293b',
                },
                '& .MuiDataGrid-cell': {
                  borderBottom: darkMode ? '1px solid #374151' : '1px solid #e2e8f0',
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: darkMode ? '#1f2937' : '#f1f5f9',
                  borderBottom: darkMode ? '1px solid #374151' : '1px solid #e2e8f0',
                },
                '& .MuiDataGrid-footerContainer': {
                  backgroundColor: darkMode ? '#1f2937' : '#f1f5f9',
                  borderTop: darkMode ? '1px solid #374151' : '1px solid #e2e8f0',
                },
              }}
            />
          </div>
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