import React, { useEffect, useState } from "react";
import { useDarkMode } from "../../context/DarkModeContext";
import { FaGears, FaUsers, FaUser, FaEye } from "react-icons/fa6"; // Added FaEye for view button
import {
  MdDashboard,
  MdCalendarToday,
  MdOutlineCalendarMonth,
  MdOutlineCalendarToday,
  MdVerifiedUser,
  MdAttachMoney,
  MdSearch,
  MdFileDownload,
  MdStars,
  MdLocationCity,
  MdRoom,
  MdQrCode,
  MdStarBorderPurple500,
  MdFilterList,
  MdPeople,
  MdEvent,
  MdLocationOn,
  MdTrendingUp,
  MdClose,
} from "react-icons/md";
import { formatDate } from "./Evenement";
import PlanSalle from "../../components/planTable/PlanSalle";
import { getTablesByEventId } from "../../services/tableService";
import { handleDownloadXLSX } from "../../services/downloadXLSX";
import { getPersonnelListByEventId } from "../../services/personnel_service";
import { motion, AnimatePresence } from "framer-motion";
import { DataGrid } from "@mui/x-data-grid";
import NotFound403 from "../../layouts/NotFound403";

const StatsCard = ({ title, value, icon: Icon, color = "blue" }) => {
  const { darkMode } = useDarkMode();
  
  const colors = {
    blue: { bg: "from-blue-500 to-cyan-500", text: "text-blue-500" },
    green: { bg: "from-green-500 to-emerald-500", text: "text-green-500" },
    purple: { bg: "from-purple-500 to-pink-500", text: "text-purple-500" },
    orange: { bg: "from-orange-500 to-yellow-500", text: "text-orange-500" },
  };

  return (
    <div
      className={`rounded-xl p-4 shadow-sm border ${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      } relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
    >
      <div
        className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${colors[color].bg} opacity-10 rounded-full -mr-4 -mt-4`}
      />

      <div className="flex items-center justify-between">
        <div>
          <p
            className={`text-sm font-medium ${
              darkMode ? "text-blue-300" : "text-blue-600"
            } mb-1`}
          >
            {title}
          </p>
          <p
            className={`text-2xl font-bold ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {value}
          </p>
        </div>
        <div
          className={`p-3 rounded-full bg-gradient-to-br ${colors[color].bg} text-white`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

// New EventCard-like component for lists within ModalEvenement
const ListCard = ({ title, details, icon: Icon, darkMode }) => {
  return (
    <div
      className={`rounded-xl p-4 border ${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      } shadow-sm`}
    >
      <div className="flex items-center gap-2 mb-2">
        {Icon && (
          <Icon className={`text-xl ${darkMode ? "text-blue-300" : "text-blue-500"}`} />
        )}
        <h4
          className={`text-md font-semibold ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          {title}
        </h4>
      </div>
      <div className="text-sm">
        {details.map((detail, index) => (
          <p key={index} className={darkMode ? "text-gray-300" : "text-gray-600"}>
            <strong>{detail.label}:</strong> {detail.value}
          </p>
        ))}
      </div>
    </div>
  );
};

const ModalEvenement = ({ isOpen, onClose, data }) => {
  const { darkMode } = useDarkMode();
  const [activeTab, setActiveTab] = useState("invites");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 855);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isOpen) return null;

  const renderTabContent = () => {
    switch (activeTab) {
      case "invites":
        return <Invites data={data} darkMode={darkMode} isMobile={isMobile} />;
      case "tables":
        return <TablePlace data={data} darkMode={darkMode} />;
      case "personnels":
        return (
          <Personnels data={data} darkMode={darkMode} isMobile={isMobile} />
        );
      // case "revenu":
      //   return <Revenus data={data} darkMode={darkMode} isMobile={isMobile} />;
      // case "commande":
        // return (
        //   <Commandes data={data} darkMode={darkMode} isMobile={isMobile} />
        // );
      default:
        return null;
    }
  };

  const gradientTitle =
    "bg-gradient-to-r from-blue-500 via-violet-500 to-purple-300 bg-clip-text text-transparent";
  const gradientButton =
    "bg-gradient-to-r from-blue-500 via-violet-500 to-purple-400 text-white";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 overflow-y-auto py-10"
      >
        <div
          className={`rounded-xl shadow-xl p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-auto ${
            darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-800"
          }`}
        >
          {/* En-tête */}
          <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 className={`text-2xl sm:text-3xl font-bold flex items-center ${gradientTitle}`}>
                <MdOutlineCalendarToday className="mr-2 sm:mr-3 text-blue-700" />
                {data?.nom}
              </h3>
              <p className="text-sm mt-1">
                Organisé par{" "}
                <span className="font-medium">{data?.user.name}</span>
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
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 my-6">
            <StatsCard
              title="Type d'événement"
              value={data?.type}
              icon={MdEvent}
              color="blue"
            />
            <StatsCard
              title="Thème"
              value={data?.theme}
              icon={MdStars}
              color="purple"
            />
            <StatsCard
              title="Date de début"
              value={formatDate(data?.date)}
              icon={MdCalendarToday}
              color="green"
            />
            <StatsCard
              title="Date de fin"
              value={formatDate(data?.date_fin)}
              icon={MdOutlineCalendarMonth}
              color="green"
            />
            <StatsCard
              title="Localisation"
              value={data?.location?.nom}
              icon={MdLocationOn}
              color="orange"
            />
            <StatsCard
              title="Salle"
              value={data?.salle?.nom}
              icon={MdLocationCity}
              color="orange"
            />
            <StatsCard
              title="Nombre d'invités"
              value={data?.invites.length}
              icon={MdPeople}
              color="purple"
            />
            <StatsCard
              title="Type d'abonnement"
              value={data?.user.forfait?.nom}
              icon={MdVerifiedUser}
              color="blue"
            />
          </div>

          {/* Onglets de navigation */}
          <div className="flex flex-wrap justify-center gap-2 my-6">
            {[
              { id: "invites", label: "Liste des invités", icon: FaUsers },
              { id: "tables", label: "Emplacements des tables", icon: MdRoom },
              { id: "personnels", label: "Liste des personnels", icon: FaUser },
              // { id: "commande", label: "Commande", icon: MdAttachMoney },
              // { id: "revenu", label: "Revenu", icon: MdTrendingUp },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
                  activeTab === tab.id
                    ? gradientButton + " shadow-md"
                    : darkMode
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Contenu dynamique */}
          <div className="mt-4">{renderTabContent()}</div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

function Invites({ data, darkMode, isMobile }) {
  const [filterField, setFilterField] = useState("nom");
  const [searchValue, setSearchValue] = useState("");

  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleExportExcel = () => {
    const exportData = data?.invites.map((p) => ({
      Nom: p?.nom,
      Prénom: p.prenom,
      Email: p.email,
      Sexe: p.sex,
      Place: p.place, // Assuming 'place' exists in invite data
      QrCode: "https://example.com/qrcode",
    }));
    handleDownloadXLSX(exportData, `invites_${data?.nom}`);
  };

  const columns = [
    { field: "nom", headerName: "Nom", flex: 1, minWidth: 120 },
    { field: "prenom", headerName: "Prénom", flex: 1, minWidth: 120 },
    { field: "email", headerName: "Email", flex: 1.5, minWidth: 180 },
    { field: "sex", headerName: "Sexe", flex: 0.7, minWidth: 80 },
    { field: "place", headerName: "Place", flex: 0.7, minWidth: 80 }, // Added Place column
    {
      field: "qrCode",
      headerName: "QR Code",
      flex: 0.5,
      minWidth: 90,
      sortable: false,
      renderCell: () => (
        <MdQrCode className="text-3xl text-gray-700 dark:text-gray-300" />
      ),
    },
  ];

  const rows = data?.invites.map((invite, index) => ({
    id: index,
    ...invite,
  }));

  const filteredRows = rows.filter((row) =>
    row[filterField]?.toString().toLowerCase().includes(searchValue.toLowerCase())
  );

  useEffect(() => {
    setCurrentPage(0);
  }, [searchValue, filterField]);

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h3
          className={`text-xl font-semibold ${
            darkMode ? "text-blue-300" : "text-blue-600"
          }`}
        >
          Liste des invités
        </h3>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Filtrage */}
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
              darkMode ? "bg-gray-700" : "bg-gray-100"
            }`}
          >
            <MdFilterList className="text-gray-500" />
            <select
              className={`p-1 bg-transparent focus:outline-none ${
                darkMode ? "text-blue-300" : "text-blue-600"
              }`}
              value={filterField}
              onChange={(e) => setFilterField(e.target.value)}
            >
              <option value="nom">Nom</option>
              <option value="prenom">Prénom</option>
              <option value="email">Email</option>
              <option value="sex">Sexe</option>
              <option value="place">Place</option>
            </select>
          </div>

          {/* Recherche */}
          <div
            className={`relative flex items-center ${
              darkMode ? "bg-gray-700" : "bg-white"
            } rounded-lg shadow-sm border ${
              darkMode ? "border-gray-600" : "border-gray-200"
            }`}
          >
            <MdSearch className="absolute left-3 text-gray-400" />
            <input
              type="text"
              placeholder={`Rechercher par ${filterField}...`}
              className={`w-full pl-10 pr-4 py-2 bg-transparent focus:outline-none ${
                darkMode
                  ? "text-blue-300 placeholder-gray-400"
                  : "text-blue-600 placeholder-gray-500"
              }`}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>

          {/* Export */}
          <button
            onClick={handleExportExcel}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg ${
              darkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-500 hover:bg-blue-600"
            } text-white transition-colors`}
          >
            <MdFileDownload className="text-lg" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {data?.invites.length === 0 ? (
        <NotFound403 message="Aucun invité trouvé" />
      ) : isMobile ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredRows.map((invite) => (
            <ListCard
              key={invite.id}
              title={`${invite?.nom} ${invite.prenom}`}
              icon={FaUsers}
              darkMode={darkMode}
              details={[
                { label: "Email", value: invite.email },
                { label: "Sexe", value: invite.sex },
                { label: "Place", value: invite.place || "N/A" },
              ]}
            />
          ))}
        </div>
      ) : (
        <div className={`py-4 rounded-xl border ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
          {/* Tableau custom */}
          <div className="grid grid-cols-12 px-4 py-2 font-semibold text-sm border-b border-gray-300 dark:border-gray-600">
            <div className="col-span-3">Nom</div>
            <div className="col-span-2">Email</div>
            <div className="col-span-2">Sexe</div>
            <div className="col-span-2">Place</div>
            <div className="col-span-3 text-center">QrCode</div>
          </div>

          <div
            className="divide-y transition-colors duration-300"
            style={{ maxHeight: "calc(100vh - 300px)", overflowY: "auto" }}
          >
            {filteredRows
              .slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage)
              .map((invite, index) => (
                <div key={invite.id} className="grid grid-cols-12 px-4 py-3 items-center text-sm">
                  <div className="col-span-3 truncate font-medium">
                    {invite?.nom} {invite.prenom}
                  </div>
                  <div className="col-span-2 truncate">{invite.email}</div>
                  <div className="col-span-2">{invite.sex}</div>
                  <div className="col-span-2">{invite.place || "N/A"}</div>
                  <div className="col-span-3 flex justify-center">
                    {/* <button
                      onClick={() => openInviteModal(invite)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 shadow-sm hover:shadow-md ${
                        darkMode
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                      }`}
                    >
                      Détails
                    </button> */}
                    <img
                      src={"data:png/image;base64,"+invite.qrCode}
                      alt={`QR Code pour l'invité ${invite?.nom}`}
                      className="w-16 h-16 object-contain rounded-md border border-gray-200 group-hover:border-indigo-300 transition-colors"
                    />
                  </div>
                </div>
              ))}
          </div>

          {/* Pagination */}
          {filteredRows.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-4 pt-4">
              {/* Lignes par page */}
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

              {/* Infos pagination */}
              <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Affichage de {(currentPage * rowsPerPage) + 1} à{" "}
                {Math.min((currentPage + 1) * rowsPerPage, filteredRows.length)} sur {filteredRows.length} invités
              </div>

              {/* Navigation */}
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
                  disabled={(currentPage + 1) * rowsPerPage >= filteredRows.length}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TablePlace({ data, darkMode }) {
  const [tables, setTables] = useState([]);

  useEffect(() => {
    if (!data?.id) return;
    getTablesByEventId(data?.id).then(setTables).catch(console.error);
  }, [data?.id]);

  return (
    <div className="p-4">
      <h3
        className={`text-xl font-semibold mb-6 ${
          darkMode ? "text-blue-300" : "text-blue-600"
        }`}
      >
        Emplacement des tables
      </h3>
      <div className="overflow-y-auto flex justify-center py-4">
        <PlanSalle
          event={{ id: data?.id }}
          tables={tables}
          setTables={setTables}
          darkMode={darkMode}
        />
      </div>
    </div>
  );
}

function Personnels({ data, darkMode, isMobile }) {
  const [personnelList, setPersonnelList] = useState([]);
  const [filterField, setFilterField] = useState("nom");
  const [searchValue, setSearchValue] = useState("");

  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    const fetchPersonnel = async () => {
      try {
        const response = await getPersonnelListByEventId(data?.id);
        setPersonnelList(response);
      } catch (error) {
        console.error("Erreur lors de la récupération des personnels : ", error);
      }
    };
    fetchPersonnel();
  }, [data?.id]);

  const handleExportExcel = () => {
    const exportData = personnelList.map((p) => ({
      Nom: p?.nom,
      Email: p.email,
      Status: p.status,
      Role: p.role,
    }));
    handleDownloadXLSX(exportData, `personnels_${data?.nom}`);
  };

  const columns = [
    { field: "nom", headerName: "Nom", flex: 1, minWidth: 150 },
    { field: "email", headerName: "Email", flex: 1.5, minWidth: 200 },
    { field: "role", headerName: "Rôle", flex: 1, minWidth: 120 },
    { field: "status", headerName: "Status", flex: 1, minWidth: 120 },
  ];

  const rows = personnelList.map((item, index) => ({
    id: index,
    ...item,
  }));

  const filteredRows = rows.filter((row) =>
    row[filterField]?.toString().toLowerCase().includes(searchValue.toLowerCase())
  );

  useEffect(() => {
    setCurrentPage(0);
  }, [searchValue, filterField]);

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h3
          className={`text-xl font-semibold ${
            darkMode ? "text-blue-300" : "text-blue-600"
          }`}
        >
          Liste des personnels
        </h3>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Filtrage */}
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
              darkMode ? "bg-gray-700" : "bg-gray-100"
            }`}
          >
            <MdFilterList className="text-gray-500" />
            <select
              className={`p-1 bg-transparent focus:outline-none ${
                darkMode ? "text-blue-300" : "text-blue-600"
              }`}
              value={filterField}
              onChange={(e) => setFilterField(e.target.value)}
            >
              <option value="nom">Nom</option>
              <option value="email">Email</option>
              <option value="role">Rôle</option>
              <option value="status">Status</option>
            </select>
          </div>

          {/* Recherche */}
          <div
            className={`relative flex items-center ${
              darkMode ? "bg-gray-700" : "bg-white"
            } rounded-lg shadow-sm border ${
              darkMode ? "border-gray-600" : "border-gray-200"
            }`}
          >
            <MdSearch className="absolute left-3 text-gray-400" />
            <input
              type="text"
              placeholder={`Rechercher par ${filterField}...`}
              className={`w-full pl-10 pr-4 py-2 bg-transparent focus:outline-none ${
                darkMode
                  ? "text-blue-300 placeholder-gray-400"
                  : "text-blue-600 placeholder-gray-500"
              }`}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>

          {/* Export */}
          <button
            onClick={handleExportExcel}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg ${
              darkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-500 hover:bg-blue-600"
            } text-white transition-colors`}
          >
            <MdFileDownload className="text-lg" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {personnelList.length === 0 ? (
        <NotFound403 message="Aucun personnel trouvé" />
      ) : isMobile ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredRows.map((personnel) => (
            <ListCard
              key={personnel.id}
              title={personnel?.nom}
              icon={FaUser}
              darkMode={darkMode}
              details={[
                { label: "Email", value: personnel.email },
                { label: "Rôle", value: personnel.role },
                { label: "Status", value: personnel.status },
              ]}
            />
          ))}
        </div>
      ) : (
        <div className={`py-4 rounded-xl border ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
          <div className="grid grid-cols-12 gap-4 px-6 py-3 font-semibold text-sm border-b border-gray-300 dark:border-gray-600">
            <div className="col-span-3">NOM</div>
            <div className="col-span-3">EMAIL</div>
            <div className="col-span-2">RÔLE</div>
            <div className="col-span-2 text-center">STATUT</div>
            {/* <div className="col-span-2 text-center">ACTIONS</div> */}
          </div>

          <div
            className="divide-y transition-colors duration-300"
            style={{ maxHeight: "calc(100vh - 250px)", overflowY: "auto" }}
          >
            {filteredRows.length > 0 ? (
              filteredRows
                .slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage)
                .map((personnel, index) => (
                  <div
                    key={personnel.id}
                    className={`grid grid-cols-12 gap-4 items-center px-6 py-4 text-sm 
                    ${darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50"}`}
                  >
                    <div className="col-span-3 font-medium truncate">
                      {personnel?.nom}
                    </div>
                    <div className="col-span-3 truncate">
                      {personnel.email}
                    </div>
                    <div className="col-span-2 truncate">
                      {personnel.role}
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        personnel.status === "Actif"
                          ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300"
                          : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                      }`}>
                        {personnel.status}
                      </span>
                    </div>
                    {/* <div className="col-span-2 flex justify-center">
                      <button
                        onClick={() => openDetails(personnel.id)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-all duration-200 shadow-sm hover:shadow-md ${
                          darkMode
                            ? "bg-blue-700 text-white hover:bg-blue-600"
                            : "bg-blue-500 text-white hover:bg-blue-600"
                        }`}
                      >
                        <FaEye className="text-sm" />
                        <span>Détails</span>
                      </button>
                    </div> */}
                  </div>
                ))
            ) : (
              <div className={`px-6 py-8 text-center text-lg font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Aucun personnel trouvé
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredRows.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-6 py-4 border-t 
                            border-gray-300 dark:border-gray-700 text-sm">
              <div className="flex items-center gap-2">
                <span className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>Lignes par page:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(0);
                  }}
                  className={`border rounded px-2 py-1 transition-colors duration-200 ${
                    darkMode ? "bg-gray-700 border-gray-600 text-gray-200" : "bg-white border-gray-300 text-gray-800"
                  }`}
                >
                  {[5, 10, 20, 50].map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Affichage de {(currentPage * rowsPerPage) + 1} à {Math.min((currentPage + 1) * rowsPerPage, filteredRows.length)} sur {filteredRows.length}
              </div>

              <div className="flex gap-2">
                <button
                  className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
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
                  className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                    darkMode
                      ? "border-gray-600 hover:bg-gray-700 disabled:bg-gray-800"
                      : "border-gray-300 hover:bg-gray-100 disabled:bg-gray-50"
                  } disabled:opacity-50`}
                  disabled={(currentPage + 1) * rowsPerPage >= filteredRows.length}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ModalEvenement;