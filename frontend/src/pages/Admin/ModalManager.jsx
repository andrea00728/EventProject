import React, { useState, useEffect } from "react";
import { useDarkMode } from "../../context/DarkModeContext";
import {
  MdCalendarToday,
  MdFileDownload,
  MdFilterList,
  MdSearch,
  MdClose,
  MdOutlineCalendarToday,
  MdEvent,
  MdStars,
  MdLocationOn,
  MdPeople,
  MdVerifiedUser
} from "react-icons/md";
import { FaEye, FaUsers } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { DataGrid } from "@mui/x-data-grid";
import { formatDate } from "./Evenement";
import ModalEvenement from "./ModalEvenement";
import { handleDownloadXLSX } from "../../services/downloadXLSX";
import NotFound403 from "../../layouts/NotFound403";

const StatsCard = ({ title, value, icon: Icon, color = "blue" }) => {
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

const EventCard = ({ event, onClick, darkMode }) => {
  return (
    <div 
      className={`rounded-xl p-4 border ${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      } shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className={`text-lg font-semibold ${
          darkMode ? "text-white" : "text-gray-900"
        }`}>
          {event.nom}
        </h3>
        <span className={`px-2 py-1 text-xs rounded-full ${
          darkMode ? "bg-blue-900 text-blue-200" : "bg-blue-100 text-blue-800"
        }`}>
          {event.type}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="flex items-center gap-2">
          <MdOutlineCalendarToday className={`${
            darkMode ? "text-blue-300" : "text-blue-500"
          }`} />
          <span className={`text-sm ${
            darkMode ? "text-gray-300" : "text-gray-600"
          }`}>
            {formatDate(event.date)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <MdLocationOn className={`${
            darkMode ? "text-blue-300" : "text-blue-500"
          }`} />
          <span className={`text-sm ${
            darkMode ? "text-gray-300" : "text-gray-600"
          }`}>
            {event.location?.nom || "Non défini"}
          </span>
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-4">
        <span className={`text-sm ${
          darkMode ? "text-purple-300" : "text-purple-600"
        }`}>
          {event.theme}
        </span>
        <button 
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
            darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"
          } transition-colors`}
        >
          <FaEye className="text-blue-500" />
          <span>Voir</span>
        </button>
      </div>
    </div>
  );
};

const ModalManager = ({ isOpen, onClose, data, managerName }) => {
  const { darkMode } = useDarkMode();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState({});
  const [filterField, setFilterField] = useState("nom");
  const [searchValue, setSearchValue] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 855);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const openModal = (event) => {
    setModalData(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setModalData({});
    setIsModalOpen(false);
  };

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
        value = event.location?.nom;
        break;
      default:
        value = "";
    }
    return value?.toLowerCase().includes(searchValue.toLowerCase());
  });

  const columns = [
    { field: "nom", headerName: "Nom", flex: 1, minWidth: 150 },
    { field: "type", headerName: "Type", flex: 1, minWidth: 120 },
    { field: "theme", headerName: "Thème", flex: 1, minWidth: 150 },
    { field: "date", headerName: "Date début", flex: 1, minWidth: 150 },
    { field: "date_fin", headerName: "Date fin", flex: 1, minWidth: 150 },
    {
      field: "locationNom",
      headerName: "Localisation",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <button
          onClick={() => openModal(params.row.event)}
          className={`group flex items-center gap-2 text-sm font-medium py-1.5 px-4 rounded-full shadow-md transition duration-200 ease-in-out ${
            darkMode 
              ? "bg-gray-700 hover:bg-gray-600 text-white" 
              : "bg-[#cfc6c4] hover:bg-[#bfb3b1] text-black"
          }`}
        >
          <FaEye className={`${
            darkMode 
              ? "text-gray-300 group-hover:text-white" 
              : "text-gray-700 group-hover:text-black"
          } transition-transform duration-200 group-hover:scale-110`} />
          <span className="tracking-wide">Voir détail</span>
        </button>
      ),
    },
  ];

  const rows = filteredData.map((value, index) => ({
    id: index,
    event: value,
    nom: value.nom,
    type: value.type,
    theme: value.theme,
    date: formatDate(value.date),
    date_fin: formatDate(value.date_fin),
    locationNom: value.location?.nom || "Non défini",
  }));

  const handleDownload = () => {
    const formattedData = filteredData.map((event) => ({
      Nom: event.nom,
      Type: event.type,
      Thème: event.theme,
      "Date début": formatDate(event.date),
      "Date fin": formatDate(event.date_fin),
      Localisation: event.location?.nom || "Non défini",
    }));
    handleDownloadXLSX(formattedData, `evenements_manager_${managerName}`);
  };

  useEffect(() => {
    setCurrentPage(0);
  }, [searchValue, filterField]);

  const gradientTitle = "bg-gradient-to-r from-blue-500 via-violet-500 to-purple-300 bg-clip-text text-transparent";
  const gradientButton = "bg-gradient-to-r from-blue-500 via-violet-500 to-purple-400 text-white";

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 overflow-y-auto py-10"
      >
        <div className={`rounded-xl shadow-xl p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-auto ${
          darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"
        }`}>
          {/* En-tête */}
          <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 className={`text-2xl sm:text-3xl font-bold flex items-center ${gradientTitle}`}>
                <MdOutlineCalendarToday className="mr-2 sm:mr-3 text-blue-700" />
                Événements de {managerName}
              </h3>
              <p className="text-sm mt-1">
                {filteredData.length} événement{filteredData.length !== 1 ? "s" : ""} trouvé{filteredData.length !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}
            >
              <MdClose className="w-6 h-6" />
            </button>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 my-6">
            <StatsCard
              title="Total"
              value={data.length}
              icon={MdEvent}
              color="blue"
            />
            <StatsCard
              title="Types différents"
              value={[...new Set(data.map(e => e.type))].length}
              icon={MdStars}
              color="purple"
            />
            <StatsCard
              title="Thèmes différents"
              value={[...new Set(data.map(e => e.theme))].length}
              icon={MdStars}
              color="green"
            />
            <StatsCard
              title="Localisations"
              value={[...new Set(data.map(e => e.location?.nom).filter(Boolean))].length}
              icon={MdLocationOn}
              color="orange"
            />
            <StatsCard
              title="Organisateur"
              value={managerName}
              icon={MdPeople}
              color="purple"
            />
          </div>

          {/* Filtrage et recherche */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              {/* Filtrage */}
              <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
                darkMode ? "bg-gray-700" : "bg-gray-100"
              }`}>
                <MdFilterList className="text-gray-500" />
                <select
                  className={`p-1 bg-transparent focus:outline-none ${
                    darkMode ? "text-blue-300" : "text-blue-600"
                  }`}
                  value={filterField}
                  onChange={(e) => setFilterField(e.target.value)}
                >
                  <option value="nom">Nom</option>
                  <option value="type">Type</option>
                  <option value="theme">Thème</option>
                  <option value="localisation">Localisation</option>
                </select>
              </div>
              
              {/* Recherche */}
              <div className={`relative flex items-center ${
                darkMode ? "bg-gray-700" : "bg-white"
              } rounded-lg shadow-sm border ${
                darkMode ? "border-gray-600" : "border-gray-200"
              }`}>
                <MdSearch className="absolute left-3 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Rechercher par ${filterField}...`}
                  className={`w-full pl-10 pr-4 py-2 bg-transparent focus:outline-none ${
                    darkMode ? "text-blue-300 placeholder-gray-400" : "text-blue-600 placeholder-gray-500"
                  }`}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
              </div>
            </div>
            
            {/* Export */}
            <button
              onClick={handleDownload}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg ${
                darkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-500 hover:bg-blue-600"
              } text-white transition-colors w-full md:w-auto`}
            >
              <MdFileDownload className="text-lg" />
              <span>Exporter</span>
            </button>
          </div>

          {/* Corps */}
          <div className="py-4">
            {isMobile ? (
              <div className="grid grid-cols-1 gap-4">
                {filteredData.length === 0 ? (
                  <NotFound403 message="Aucun événement trouvé" />
                ) : (
                  filteredData.map((event, index) => (
                    <EventCard 
                      key={index} 
                      event={event} 
                      onClick={() => openModal(event)}
                      darkMode={darkMode}
                    />
                  ))
                )}
              </div>
            ) : (filteredData.length === 0 ? (
              <NotFound403 message="Aucun événement trouvé" />
            ) : (
              <>
                {/* En-têtes */}
                <div className="grid grid-cols-12 px-4 py-2 font-semibold text-sm border-b border-gray-300 dark:border-gray-600">
                  <div className="col-span-3">Nom</div>
                  <div className="col-span-2">Type</div>
                  <div className="col-span-2">Thème</div>
                  <div className="col-span-3">Localisation</div>
                  <div className="col-span-2 text-center">Actions</div>
                </div>

                {/* Lignes de données */}
                <div
                  className="divide-y transition-colors duration-300"
                  style={{ maxHeight: "calc(70vh)", overflowY: "auto" }}
                >
                  {filteredData
                    .slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage)
                    .map((event, index) => (
                      <div key={index} className="grid grid-cols-12 px-4 py-3 items-center text-sm">
                        <div className="col-span-3 truncate font-medium">{event.nom}</div>
                        <div className="col-span-2">{event.type}</div>
                        <div className="col-span-2 truncate">{event.theme}</div>
                        <div className="col-span-3 truncate">{event.location?.nom || "N/A"}</div>
                        <div className="col-span-2 flex justify-center">
                          <button
                            onClick={() => openModal(event)}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 shadow-sm hover:shadow-md ${
                              darkMode
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                            }`}
                          >
                            Détails
                          </button>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center mt-4 px-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Lignes par page:</span>
                    <select
                      value={rowsPerPage}
                      onChange={(e) => {
                        setRowsPerPage(Number(e.target.value));
                        setCurrentPage(0);
                      }}
                      className={`border rounded px-2 py-1 ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-gray-200"
                          : "bg-white border-gray-300 text-gray-800"
                      }`}
                    >
                      {[5, 10, 20, 50].map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    Affichage de {(currentPage * rowsPerPage) + 1} à{" "}
                    {Math.min((currentPage + 1) * rowsPerPage, filteredData.length)} sur {filteredData.length} événements
                  </div>

                  <div className="flex space-x-2">
                    <button
                      className={`px-4 py-2 rounded-lg border text-sm transition-colors duration-200 ${
                        darkMode
                          ? "border-gray-600 hover:bg-gray-700 disabled:bg-gray-800"
                          : "border-gray-300 hover:bg-gray-100 disabled:bg-gray-50"
                      } disabled:opacity-50`}
                      disabled={currentPage === 0}
                      onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                    >
                      Précédent
                    </button>
                    <button
                      className={`px-4 py-2 rounded-lg border text-sm transition-colors duration-200 ${
                        darkMode
                          ? "border-gray-600 hover:bg-gray-700 disabled:bg-gray-800"
                          : "border-gray-300 hover:bg-gray-100 disabled:bg-gray-50"
                      } disabled:opacity-50`}
                      disabled={(currentPage + 1) * rowsPerPage >= filteredData.length}
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              </>
            ))}
          </div>

          {/* Modal détail d'événement */}
          <ModalEvenement
            isOpen={isModalOpen}
            onClose={closeModal}
            data={modalData}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ModalManager;