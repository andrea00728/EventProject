import { useEffect, useState } from "react";
import ModalEvenement from "./ModalEvenement";
import { getAllEvents } from "../../services/evenementServ";
import { FaEye } from "react-icons/fa";
import { MdCalendarToday, MdFileDownload, MdSearch, MdFilterList } from "react-icons/md";
import { handleDownloadXLSX } from "../../services/downloadXLSX";

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

  // Filtrage dynamique
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
    const page = (filteredData === 0 ? data : filteredData).map((value) => ({
      Nom: value.nom,
      Type: value.type,
      Theme: value.theme,
      Date_debut: value.date,
      Date_fin: value.date_fin,
      Localisation: value.location.nom,
      Organisateur: value.user.name,
    }));
    handleDownloadXLSX(page, "liste_evenements");
  };

  return (
    <div className="p-8 h-screen bg-white rounded-2xl shadow-2xl border border-gray-200">
      <div>
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-b border-gray-200 pb-4 flex items-center">
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

      <div className="flex justify-center items-center pt-5">
        <div className="bg-white shadow-2xl rounded-2xl p-4 overflow-y-auto">
          {loading && (
            <p className="text-center text-lg py-5">
              Chargement des événements...
            </p>
          )}
          {error && (
            <p className="text-center text-lg py-5 text-red-600">{error}</p>
          )}
          {!loading && !error && filteredData.length === 0 && (
            <p className="text-center text-lg py-5">
              Aucun événement trouvé.
            </p>
          )}
          {!loading && !error && filteredData.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th className="p-3 text-start font-semibold">Nom</th>
                  <th className="p-3 text-start font-semibold">Type</th>
                  <th className="p-3 text-start font-semibold">Thème</th>
                  <th className="p-3 text-start font-semibold">Date début</th>
                  <th className="p-3 text-start font-semibold">Date fin</th>
                  <th className="p-3 text-start font-semibold">Localisation</th>
                  <th className="p-3 text-start font-semibold">Organisateur</th>
                  <th className="p-3 text-start font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((value, key) => (
                  <tr key={key}>
                    <td className="p-3 text-start ">{value.nom}</td>
                    <td className="p-3 text-start ">{value.type}</td>
                    <td className="p-3 text-start ">{value.theme}</td>
                    <td className="p-3 text-start ">
                      {formatDate(value.date)}
                    </td>
                    <td className="p-3 text-start ">
                      {formatDate(value.date_fin)}
                    </td>
                    <td className="p-3 text-start ">{value.location.nom}</td>
                    <td className="p-3 text-start ">{value.user.name}</td>
                    <td>
                      <button
                        className="py-2 px-4 text-black font-semibold rounded-2xl border-none text-start bg-[#cfc6c4] cursor-pointer hover:bg-[#c2bab8] transition duration-200"
                        onClick={() => openModal(key)}
                      >
                        Détail <FaEye className="ml-1 mb-1 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <ModalEvenement
            isOpen={isModalOpen}
            onClose={closeModal}
            data={modalData}
          />
        </div>
      </div>
    </div>
  );
}
