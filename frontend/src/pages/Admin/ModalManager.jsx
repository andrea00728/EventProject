import React, { useState } from "react";
import {
  MdCalendarToday,
  MdFileDownload,
  MdFilterList,
  MdSearch,
} from "react-icons/md";
import { FaEye } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import { DataGrid } from "@mui/x-data-grid";
import { formatDate } from "./Evenement";
import ModalEvenement from "./ModalEvenement";
import { handleDownloadXLSX } from "../../services/downloadXLSX";

const ModalManager = ({ isOpen, onClose, data, managerName }) => {
  if (!isOpen) return null;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState({});
  const [filterField, setFilterField] = useState("nom");
  const [searchValue, setSearchValue] = useState("");

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
          onClick={() => openModal(params.row.index)}
          className="group flex items-center mt-2 gap-2 bg-[#cfc6c4] hover:bg-[#bfb3b1] text-sm text-black font-medium py-1.5 px-4 rounded-full shadow-md transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#cfc6c4]"
        >
          <FaEye className="text-gray-700 group-hover:text-black transition-transform duration-200 group-hover:scale-110" />
          <span className="tracking-wide">Voir détail</span>
        </button>
      ),
    },
  ];

  const rows = filteredData.map((value, index) => ({
    id: index,
    index,
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
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="fixed inset-0  flex items-center justify-center z-50"
      >
        <div className="bg-white rounded-lg shadow-xl p-6 w-full h-screen mx-4 relative">
          {/* En-tête */}
          <div className="flex justify-between items-center pb-3 border-b border-gray-200">
            <h3 className="text-2xl font-semibold text-gray-800">
              <MdCalendarToday className="mr-3 mb-2 inline" />
              Liste d'événements de {managerName}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>

          {/* Filtrage */}
          <div className="flex justify-end my-2">
            <button
              onClick={handleDownload}
              className="bg-[#cfc6c4] hover:bg-[#c2bab8] rounded-2xl px-6 py-2 text-[17px] text-black font-semibold cursor-pointer"
            >
              Exporter en CSV <MdFileDownload className="inline ml-2" />
            </button>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4 mb-6 mt-4">
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

          {/* Corps */}
          <div className="py-4 overflow-y-auto h-[calc(100%-80px)]">
            <div
              className="h-[600px] w-full overflow-auto"
            >
              <DataGrid
                rows={rows}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5, 10]}
                autoHeight
              />
            </div>
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
