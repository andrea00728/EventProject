import { useEffect, useState } from "react";
import { deleteManager, getManagerList } from "../../services/inviteService";
import { formatDate } from "./Evenement";
import {
  MdFileDownload,
  MdSearch,
  MdOutlineCalendarMonth,
  MdFilterList,
} from "react-icons/md";
import { TbTrashXFilled } from "react-icons/tb";
import { getAllManagerEvents } from "../../services/evenementServ";
import ModalManager from "./ModalManager";
import DeleteModal from "./DeleteModal";
import { FaUsers } from "react-icons/fa6";
import { handleDownloadXLSX } from "../../services/downloadXLSX";
import { DataGrid } from "@mui/x-data-grid";
import { motion } from "framer-motion";
import { io } from "socket.io-client";

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

  useEffect(() => {
    document.title = "Organisateur - Admin";
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getManagerList();
        setData(data);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des organisateurs :",
          error
        );
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
          m.id === lastLogin ? { ...m, lastLogin: formatDate(new Date) } : m,
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

  const handleDownload = () => {
    const page = data.map((p) => ({
      Nom: p.name,
      Email: p.email,
      Date_creation: formatDate(p.createdAt),
      Statut: p.isOnline ? "En ligne" : "Hors ligne",
      Derniere_connexion: formatDate(p.lastLogin),
    }));
    handleDownloadXLSX(page, "liste_organisateurs");
  };

  return (
    <div className="py-10 px-8 h-screen overflow-auto flex flex-col">
      <div>
        <h2 className="text-3xl font-bold mb-8 text-gray-800 flex items-center">
          <FaUsers className="mr-3" /> Liste des organisateurs
        </h2>
      </div>

      <div className="flex justify-end mb-4">
        <button
          onClick={handleDownload}
          className="bg-[#cfc6c4] hover:bg-[#c2bab8] rounded-2xl px-6 py-2 text-[17px] text-black font-semibold cursor-pointer"
        >
          Exporter en CSV <MdFileDownload className="inline ml-2" />
        </button>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <MdFilterList className="text-gray-500" />
          <select
            className="p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#cfc6c4]"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="name">Nom</option>
            <option value="email">Email</option>
          </select>
        </div>
        <div className="relative w-full md:w-1/3">
          <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={`Rechercher par ${filterType}...`}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#cfc6c4]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-white shadow-2xl rounded-2xl p-4">
        {loading ? (
          <p className="text-center text-lg py-5">Chargement...</p>
        ) : filteredData.length === 0 ? (
          <p className="text-center text-lg py-5 text-gray-600">
            Aucun organisateur correspondant
          </p>
        ) : (
          <div className="h-[600px] w-full overflow-auto">
            <DataGrid
              rows={filteredData.map((org) => ({
                id: org.id,
                name: org.name,
                email: org.email,
                nameForfait: org.forfait?.nom || "Aucun forfait",
                createdAt: formatDate(org.createdAt),
                forfaitexpirationdate: formatDate(org.forfaitexpirationdate),
                status: org.isOnline ? "En ligne" : "Hors ligne",
                lastLogin: formatDate(org.lastLogin),
                fullData: org,
              }))}
              columns={[
                { field: "name", headerName: "Nom", flex: 1, minWidth: 150 },
                { field: "email", headerName: "Email", flex: 1, minWidth: 200 },
                {
                  field: "nameForfait",
                  headerName: "Forfait",
                  flex: 1,
                  minWidth: 150,
                },
                {
                  field: "createdAt",
                  headerName: "Date de création",
                  flex: 1,
                  minWidth: 150,
                },
                {
                  field: "forfaitexpirationdate",
                  headerName: "Date d'expiration",
                  flex: 1,
                  minWidth: 170,
                },
                {
                  field: "status",
                  headerName: "Statut",
                  flex: 1,
                  minWidth: 120,
                  renderCell: (params) => (
                    <span
                      className={`px-2 py-1 rounded-full text-center text-sm font-semibold ${
                        params.value === "En ligne"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {params.value}
                    </span>
                  ),
                },
                {
                  field: "lastLogin",
                  headerName: "Dernière connexion",
                  flex: 1,
                  minWidth: 170,
                },
                {
                  field: "actions",
                  headerName: "Actions",
                  flex: 1,
                  minWidth: 220,
                  sortable: false,
                  renderCell: (params) => {
                    const org = params.row.fullData;
                    return (
                      <div className="flex gap-2 items-center pt-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            handleTakeManagerEvents(org.id);
                            setManagerName(org.name);
                          }}
                          className="inline-flex items-center gap-2 bg-[#cfc6c4] hover:bg-[#bfb3b1] text-sm text-black font-semibold py-1.5 px-4 rounded-full shadow-md transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#cfc6c4]"
                        >
                          <MdOutlineCalendarMonth className="text-lg" />
                          <span>Ses événements</span>
                        </motion.button>

                        <button
                          onClick={() => openDeleteModal(org)}
                          className="text-red-600 hover:text-red-800 text-2xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 rounded"
                        >
                          <TbTrashXFilled />
                        </button>
                      </div>
                    );
                  },
                },
              ]}
              pageSize={5}
              rowsPerPageOptions={[5, 10, 20]}
              disableSelectionOnClick
              autoHeight
              sx={{
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#f5f5f5",
                  fontWeight: "bold",
                },
                "& .MuiDataGrid-cell": {
                  borderBottom: "1px solid #e0e0e0",
                },
                "& .MuiDataGrid-row:hover": {
                  backgroundColor: "#f9f9f9",
                },
              }}
            />
          </div>
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
