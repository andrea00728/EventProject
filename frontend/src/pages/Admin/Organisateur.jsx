import React, { useEffect, useState, useMemo } from "react";
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
import { FaUsers, FaEye } from "react-icons/fa";
import { handleDownloadXLSX } from "../../services/downloadXLSX";
import { DataGrid } from "@mui/x-data-grid";
import { useDarkMode } from "../../context/DarkModeContext";

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
  const { darkMode } = useDarkMode();

  useEffect(() => {
    document.title = "Organisateur - Admin";
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getManagerList();
        setData(data.map(org => ({
          ...org,
          forfait: org.forfait || null, // Garantit que forfait existe
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
  }, []);

  const filteredData = data.filter((organisateur) =>
    organisateur[filterType].toLowerCase().includes(searchTerm.toLowerCase())
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

  const bgClass = darkMode 
    ? "bg-gray-900 text-gray-200" 
    : "bg-gradient-to-r from-white to-gray-50 text-gray-800";

  return (
    <div className={`min-h-screen p-4 sm:p-6 md:p-8 w-full mx-auto transition duration-500 ${bgClass}`}>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className={`text-2xl sm:text-3xl font-bold flex items-center ${
          darkMode ? "text-blue-300" : "text-blue-600"
        }`}>
          <FaUsers className="mr-3" /> Liste des organisateurs
        </h2>

        
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
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl w-full ${
              darkMode 
                ? "bg-blue-600 hover:bg-blue-700 text-white" 
                : "bg-blue-500 hover:bg-blue-600 text-white"
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
            <div className="hidden md:block h-[600px] w-full overflow-hidden rounded-xl shadow-sm">
              <DataGrid
                rows={filteredData}
                columns={[
                  { 
                    field: "name", 
                    headerName: "NOM", 
                    flex: 1.5,
                    renderCell: (params) => (
                      <div className={`font-medium ${darkMode ? "text-blue-300" : "text-blue-600"}`}>
                        {params.value}
                      </div>
                    )
                  },
                  { 
                    field: "email", 
                    headerName: "EMAIL", 
                    flex: 1.5,
                    renderCell: (params) => (
                      <div className={`${darkMode ? "text-blue-300" : "text-blue-600"}`}>
                        {params.value}
                      </div>
                    )
                  },
                  {
                    field: "forfait",
                    headerName: "FORFAIT",
                    flex: 1,
                    valueGetter: (params) => {
                      if (!params.nom) return "Aucun forfait";
                      return params.nom || "Aucun forfait";
                    },
                    renderCell: (params) => (
                      <span className={`${darkMode ? "text-purple-300" : "text-purple-600"}`}>
                        {params.value}
                      </span>
                    )
                  },
                  {
                    field: "createdAt",
                    headerName: "DATE CRÉATION",
                    flex: 1,
                    renderCell: (params) => (
                      <div className={`text-sm ${darkMode ? "text-blue-300" : "text-blue-600"}`}>
                        {params.value}
                      </div>
                    )
                  },
                  {
                    field: "forfaitexpirationdate",
                    headerName: "EXPIRATION",
                    flex: 1,
                    renderCell: (params) => (
                      <div className={`text-sm ${darkMode ? "text-blue-300" : "text-blue-600"}`}>
                        {params.value}
                      </div>
                    )
                  },
                  {
                    field: "actions",
                    headerName: "ACTIONS",
                    flex: 1,
                    sortable: false,
                    renderCell: (params) => (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            handleTakeManagerEvents(params.row.id);
                            setManagerName(params.row.name);
                          }}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm ${
                            darkMode
                              ? "bg-blue-600 hover:bg-blue-700 text-white"
                              : "bg-blue-500 hover:bg-blue-600 text-white"
                          } transition-colors duration-200`}
                        >
                          <FaEye className="text-sm" />
                          <span>Événements</span>
                        </button>

                        <button
                          onClick={() => openDeleteModal(params.row)}
                          className={`p-2 rounded-lg ${
                            darkMode
                              ? "text-red-400 hover:text-red-300"
                              : "text-red-600 hover:text-red-800"
                          } transition-colors duration-200`}
                        >
                          <TbTrashXFilled className="text-lg" />
                        </button>
                      </div>
                    ),
                  },
                ]}
                pageSize={10}
                rowsPerPageOptions={[5, 10, 20]}
                disableSelectionOnClick
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
                  },
                }}
              />
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