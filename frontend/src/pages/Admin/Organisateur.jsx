import React, { useEffect, useState, useMemo, useRef } from "react";
import { deleteManager, getManagerList } from "../../services/inviteService";
import { formatDate } from "./Evenement";
import {
  MdFileDownload,
  MdSearch,
  MdFilterList,
  MdPeople,
  MdEvent,
  MdEmail,
  MdPerson,
  MdCalendarToday,
  MdTrendingUp
} from "react-icons/md";
import { TbTrashXFilled } from "react-icons/tb";
import { getAllManagerEvents } from "../../services/evenementServ";
import ModalManager from "./ModalManager";
import DeleteModal from "./DeleteModal";
import { FaUsers, FaEye, FaUser } from "react-icons/fa";
import { handleDownloadXLSX } from "../../services/downloadXLSX";
import { DataGrid } from "@mui/x-data-grid";
import { useDarkMode } from "../../context/DarkModeContext";
import { FaBell, FaEnvelope } from "react-icons/fa6";
import { ChevronDown } from "lucide-react";
import { io } from 'socket.io-client';




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
            darkMode ? "text-blue-300" : "text-blue-600"
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

// Composant OrganisateurCard pour la version mobile
const OrganisateurCard = ({ organisateur, darkMode, onViewEvents, onDelete }) => {
  return (
    <div className={`p-4 mb-4 rounded-xl shadow-sm border transition-all duration-300 ${
      darkMode ? "bg-gray-800 border-gray-700 hover:border-gray-600" : "bg-white border-gray-200 hover:border-gray-300"
    }`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className={`text-lg font-semibold ${
            darkMode ? "text-blue-300" : "text-blue-600"
          }`}>
            {organisateur.name}
          </h3>
          <p className={`text-sm ${
            darkMode ? "text-gray-300" : "text-gray-600"
          }`}>
            {organisateur.email}
          </p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs ${
          organisateur.status === 'active'
            ? darkMode
              ? 'bg-green-900/50 text-green-300'
              : 'bg-green-100 text-green-800'
            : darkMode
              ? 'bg-gray-700/50 text-gray-400'
              : 'bg-gray-100 text-gray-600'
        }`}>
          {organisateur.status === 'active' ? 'Actif' : 'Inactif'}
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
            {organisateur.forfait?.nom || "Aucun forfait"}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <MdCalendarToday className={`text-sm ${
            darkMode ? "text-cyan-400" : "text-cyan-600"
          }`} />
          <span className={`text-sm ${
            darkMode ? "text-gray-300" : "text-gray-600"
          }`}>
            {organisateur.createdAt.split(' ')[0]}
          </span>
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-3">
        <div>
          <p className={`text-xs ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}>
            Expiration forfait
          </p>
          <p className={`text-sm ${
            darkMode ? "text-gray-200" : "text-gray-700"
          }`}>
            {organisateur.forfaitexpirationdate || "N/A"}
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => onViewEvents(organisateur.id, organisateur.name)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm ${
              darkMode
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            } transition-colors duration-200`}
          >
            <FaEye className="text-sm" />
            <span>Événements</span>
          </button>
          
          <button
            onClick={() => onDelete(organisateur)}
            className={`p-2 rounded-lg ${
              darkMode
                ? 'text-red-400 hover:text-red-300'
                : 'text-red-600 hover:text-red-800'
            } transition-colors duration-200`}
          >
            <TbTrashXFilled className="text-lg" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Organisateur() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("name");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [managerName, setManagerName] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedManager, setSelectedManager] = useState(null);
  const [loading, setLoading] = useState(true);
  // const { darkMode } = useDarkMode();

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

  useEffect(() => {
    document.title = "Organisateur - Admin";
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getManagerList();
        setData(data.map(org => ({
          ...org,
          forfait: org.forfait || null, 
          createdAt: formatDate(org.createdAt),
          forfaitexpirationdate: org.forfaitexpirationdate 
            ? formatDate(org.forfaitexpirationdate) 
            : "N/A"
        })));
      } catch (error) {
        console.error("Erreur lors de la récupération des organisateurs :", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    const socket = io("http://localhost:3000", {
      auth: {
        userId: 'b101b3b2-880b-47c2-a1ad-31ebbf61aa6d', // Remplace par un ID réel, ex: "admin-1"
      },
    });

    socket.on("connect", () => {
      console.log("🟢 SuperAdmin connecté au WebSocket !");
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Erreur WebSocket SuperAdmin :", err.message);
    });

    socket.on("organizer_connected", ({ userId }) => {
      console.log("📡 SuperAdmin reçoit organizer_connected :", userId);

      setData((prev) => {
        const match = prev.find((m) => m.id === userId);
        console.log("Correspondance trouvée :", !!match);
        return prev.map((m) =>
          m.id === userId ? { ...m, isOnline: true } : m,
        );
      });
    });

    socket.on("organizer_disconnected", ({ userId }) => {
      setData((prev) =>
        prev.map((m) => (m.id === userId ? { ...m, isOnline: false } : m))
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const filteredData = data.filter((organisateur) =>
    organisateur[filterType]?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTakeManagerEvents = async (id) => {
    try {
      const data = await getAllManagerEvents(id);
      if (data.length === 0) {
        alert("Aucun événement trouvé pour cet organisateur.");
        return;
      } else {
        setModalData(data);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des événements :", error);
    }
  };

  const openDeleteModal = (manager) => {
    setSelectedManager(manager);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setSelectedManager(null);
    setIsDeleteModalOpen(false);
  };

  const handleDeleteManager = async () => {
    try {
      await deleteManager(selectedManager.id);
      closeDeleteModal();
      setData((prev) => prev.filter((m) => m.id !== selectedManager.id));
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
    }
  };

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

  const handleDownload = () => {
    const page = data.map((p) => ({
      Nom: p.name,
      Email: p.email,
      Date_creation: p.createdAt,
      Forfait: p.forfait?.nom || "Aucun",
      Expiration: p.forfaitexpirationdate
    }));
    handleDownloadXLSX(page, "liste_organisateurs");
  };

  const stats = useMemo(() => {
    const total = data.length;
    const active = data.filter(e => e.status === 'active').length;
    const withForfait = data.filter(e => e.forfait && e.forfait.nom).length;
    // const eventCount = data.reduce((sum,e) => sum + (e.eventsCount || 0), 0);
    const avgEvents = total > 0 ? Math.round(data.reduce((sum, e) => sum + (e.eventsCount || 0), 0) / total) : 0;

    return {
      total,
      active,
      withForfait,
      avgEvents
    };
  }, [data]);

  const gradientTitle =
    "bg-gradient-to-r from-blue-500 via-violet-500 to-purple-300 bg-clip-text text-transparent";
  const gradientButton =
    "bg-gradient-to-r from-blue-500 via-violet-500 to-purple-400 text-white";

  const gradientsEvent = {
    eventButton: "bg-gradient-to-r from-indigo-600 via-blue-500 to-indigo-700 text-white"
  };

  const bgClass = darkMode 
    ? "bg-gray-900 text-gray-200" 
    : "bg-gradient-to-r from-white to-gray-50 text-gray-800";

  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  return (
    <div className={`min-h-screen p-4 sm:p-6 md:p-8 w-full mx-auto transition duration-500 ${bgClass}`}>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className={`text-2xl sm:text-3xl font-bold flex items-center ${ gradientTitle }`}>
          <FaUsers className="mr-2 sm:mr-3 text-blue-700" /> Liste des organisateurs
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Organisateurs"
          value={stats.total}
          icon={MdPeople}
          trend={5}
          color="blue"
        />
        <StatsCard
          title="Organisateurs Actifs"
          value={stats.active}
          icon={MdPerson}
          trend={8}
          color="green"
        />
        <StatsCard
          title="Avec Forfait"
          value={stats.withForfait}
          icon={MdEvent}
          trend={12}
          color="purple"
        />
        <StatsCard
          title="Moyenne Événements"
          value={stats.avgEvents}
          icon={MdCalendarToday}
          trend={-2}
          color="orange"
        />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className={`flex items-center gap-2 px-5 py-0.5 rounded-lg ${
            darkMode ? "bg-gray-800" : "bg-gray-100"
          }`}>
            <MdFilterList className="text-gray-500" />
            <select
              className={`p-2 bg-transparent focus:outline-none ${
                darkMode ? "text-blue-300" : "text-blue-600"
              }`}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="name">Nom</option>
              <option value="email">Email</option>
            </select>
          </div>
          
          <div className={`relative w-full sm:w-64 flex items-center ${
            darkMode ? "bg-gray-800" : "bg-white"
          } rounded-lg shadow-sm border ${
            darkMode ? "border-gray-700" : "border-gray-200"
          }`}>
            <MdSearch className="absolute left-3 text-gray-400" />
            <input
              type="text"
              placeholder={`Rechercher par ${filterType}...`}
              className={`w-full pl-10 pr-4 py-2 bg-transparent focus:outline-none ${
                darkMode ? "text-blue-300 placeholder-gray-400" : "text-blue-600 placeholder-gray-500"
              }`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

        </div>
        <div className="w-full sm:w-auto sm:ml-auto">
          <button
            onClick={handleDownload}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl w-full ${ gradientButton } transition-colors duration-200 shadow-md hover:shadow-lg`}
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
        ) : filteredData.length === 0 ? (
          <div className="text-center py-12">
            <FaUsers className={`w-16 h-16 mx-auto mb-4 ${
              darkMode ? "text-gray-600" : "text-gray-300"
            }`} />
            <p className={`text-lg ${
              darkMode ? "text-purple-300" : "text-purple-600"
            }`}>
              Aucun organisateur trouvé
            </p>
          </div>
        ) : (
          <>
            {/* Version mobile - Cards */}
            <div className="block md:hidden space-y-4">
              {filteredData.map((organisateur) => (
                <OrganisateurCard 
                  key={organisateur.id}
                  organisateur={organisateur}
                  darkMode={darkMode}
                  onViewEvents={(id, name) => {
                    handleTakeManagerEvents(id);
                    setManagerName(name);
                  }}
                  onDelete={openDeleteModal}
                />
              ))}
            </div>

            {/* Version desktop - DataGrid */}
            <div className="hidden md:block rounded-tl-xl rounded-br-xl rounded-tr-none rounded-bl-none border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800 w-full">
              {/* En-têtes du tableau - Modifié pour l'ajustement automatique */}
              <div className="grid grid-cols-[minmax(150px,1fr)_minmax(200px,1.5fr)_minmax(120px,1fr)_minmax(120px,1fr)_minmax(100px,1fr)_minmax(140px,1fr)] gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                <div className="truncate">NOM</div>
                <div className="truncate">EMAIL</div>
                <div className="truncate">FORFAIT</div>
                <div className="truncate">DATE CRÉATION</div>
                <div className="truncate">EXPIRATION</div>
                <div className="truncate text-center">ACTIONS</div>
              </div>

              {/* Contenu du tableau - Structure identique mais avec ajustement automatique */}
              <div className="divide-y divide-gray-200 dark:divide-gray-700" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                {filteredData
                  .slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage)
                  .map((manager, index) => (
                    <div 
                      key={index}
                      className="grid grid-cols-[minmax(150px,1fr)_minmax(200px,1.5fr)_minmax(120px,1fr)_minmax(120px,1fr)_minmax(100px,1fr)_minmax(140px,1fr)] gap-2 px-4 py-3 items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                    >
                      {/* Nom */}
                      <div className="truncate font-medium dark:text-blue-300 text-blue-600">
                        {manager.name}
                      </div>

                      {/* Email */}
                      <div className="truncate dark:text-blue-300 text-blue-600">
                        {manager.email}
                      </div>

                      {/* Forfait */}
                      <div className="truncate dark:text-purple-300 text-purple-600">
                        {manager.forfait?.nom || "Aucun forfait"}
                      </div>

                      {/* Date Création */}
                      <div className="truncate text-sm dark:text-blue-300 text-blue-600">
                        {manager.createdAt}
                      </div>

                      {/* Expiration */}
                      <div className="truncate text-sm dark:text-blue-300 text-blue-600">
                        {manager.forfaitexpirationdate}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            handleTakeManagerEvents(manager.id);
                            setManagerName(manager.name);
                          }}
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs ${
                            gradientsEvent.eventButton
                          } transition-colors duration-200 shadow-sm hover:shadow-md truncate`}
                        >
                          <FaEye className="text-xs" />
                          <span>Événements</span>
                        </button>

                        <button
                          onClick={() => openDeleteModal(manager)}
                          className={`p-1.5 rounded-lg ${
                            darkMode
                              ? 'text-red-400 hover:text-red-300'
                              : 'text-red-600 hover:text-red-800'
                          } transition-colors duration-200`}
                        >
                          <TbTrashXFilled className="text-lg" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Pagination - Inchangé */}
              {filteredData.length > 0 && (
                <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-300">
                  {/* Sélection du nombre de lignes */}
                  <div className="flex items-center space-x-2">
                    <span>Lignes par page:</span>
                    <select 
                      value={rowsPerPage}
                      onChange={(e) => {
                        setRowsPerPage(Number(e.target.value));
                        setCurrentPage(0);
                      }}
                      className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700"
                    >
                      {[5, 10, 20].map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>

                  {/* Info de pagination */}
                  <div>
                    Affichage de {(currentPage * rowsPerPage) + 1} à {Math.min((currentPage + 1) * rowsPerPage, filteredData.length)} sur {filteredData.length} gestionnaires
                  </div>

                  {/* Boutons de navigation */}
                  <div className="flex space-x-2">
                    <button 
                      className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                      disabled={currentPage === 0}
                      onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                    >
                      Précédent
                    </button>
                    <button 
                      className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                      disabled={(currentPage + 1) * rowsPerPage >= filteredData.length}
                      onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              )}

              {filteredData.length === 0 && (
                <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  Aucun gestionnaire trouvé
                </div>
              )}
            </div>
          </>
        )}

        <ModalManager
          isOpen={isModalOpen}
          onClose={() => {
            setModalData([]);
            setManagerName("");
            setIsModalOpen(false);
          }}
          data={modalData}
          managerName={managerName || "Organisateur"}
        />

        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDeleteManager}
          managerName={selectedManager?.name}
        />
      </div>
    </div>
  );
}