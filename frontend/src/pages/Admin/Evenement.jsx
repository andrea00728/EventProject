import { useEffect, useState } from "react";
import ModalEvenement from "./ModalEvenement";
import { getAllEvents } from "../../services/evenementServ";
import { FaEye } from "react-icons/fa";
import {
  MdCalendarToday,
  MdFileDownload,
  MdSearch,
  MdFilterList,
} from "react-icons/md";
import { handleDownloadXLSX } from "../../services/downloadXLSX";
import { DataGrid } from "@mui/x-data-grid";

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

export default function EvenementAd() {
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        console.error(
          "Erreur lors de la récupération des événements : ",
          error
        );
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

  return (
    <div className="p-8 h-screen bg-white rounded-2xl shadow-2xl border border-gray-200">
      <div>
        <h2 className="text-3xl font-bold mb-8 text-gray-800 flex items-center">
          <MdCalendarToday className="mr-3" /> Liste des événements
        </h2>
      </div>

      <div className="flex justify-end mb-4">
        <button
          onClick={handleExportExcel}
          className="bg-[#cfc6c4] hover:bg-[#c2bab8] rounded-2xl px-6 py-2 text-[17px] text-black font-semibold cursor-pointer"
        >
          Exporter en CSV <MdFileDownload className="inline ml-2" />
        </button>
      </div>

      {/* Filtrage dynamique amélioré */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <MdFilterList className="text-gray-500" />
          <select
            className="p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#cfc6c4]"
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
        <div className="relative w-full md:w-1/3">
          <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={`Rechercher par ${filterField}...`}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#cfc6c4]"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white shadow-2xl rounded-2xl p-4">
        {loading ? (
          <p className="text-center text-lg py-5">Chargement...</p>
        ) : error ? (
          <p className="text-center text-lg py-5 text-red-600">{error}</p>
        ) : filteredData.length === 0 ? (
          <p className="text-center text-lg py-5">Aucun événement trouvé.</p>
        ) : (
          <div className="h-[600px] w-full overflow-auto">
            <DataGrid
              autoHeight
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
                      className="group flex items-center mt-2 gap-2 bg-[#cfc6c4] hover:bg-[#bfb3b1] text-sm text-black font-medium py-1.5 px-4 rounded-full shadow-md transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#cfc6c4]"
                    >
                      <FaEye className="text-gray-700 group-hover:text-black transition-transform duration-200 group-hover:scale-110" />
                      <span className="tracking-wide">Voir détail</span>
                    </button>
                  ),
                },
              ]}
              pageSize={5}
              rowsPerPageOptions={[5, 10, 20]}
              disableSelectionOnClick
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
