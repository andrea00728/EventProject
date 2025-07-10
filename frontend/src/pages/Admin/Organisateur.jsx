import { useEffect, useState } from "react";
import { deleteManager, getManagerList } from "../../services/inviteService";
import { formatDate } from "./Evenement";
import { MdFileDownload, MdSearch } from "react-icons/md";
import { TbTrashXFilled } from "react-icons/tb";
import { getAllManagerEvents } from "../../services/evenementServ";
import ModalManager from "./ModalManager";
import DeleteModal from "./DeleteModal";
import { FaUsers } from "react-icons/fa6";
import { handleDownloadXLSX } from "../../services/downloadXLSX";
import { motion, AnimatePresence } from "framer-motion";

export default function Organisateur() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("name");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [managerName, setManagerName] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedManager, setSelectedManager] = useState(null);

  useEffect(() => {
    document.title = "Organisateur - Admin";
    const fetchData = async () => {
      try {
        const data = await getManagerList();
        setData(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des organisateurs :", error);
      }
    };
    fetchData();
  }, []);

  const filteredData = data.filter((organisateur) =>
    organisateur[filterType]
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
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
    }));
    handleDownloadXLSX(page, "liste_organisateurs");
  };

  return (
    <div className="py-10 px-8 h-screen bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-b border-gray-200 pb-4 flex items-center">
        <FaUsers className="mr-3" /> Liste des organisateurs
      </h2>

      {/* Zone de recherche */}
      <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
        <div className="flex items-center bg-gray-100 rounded-xl px-4 py-2 shadow-inner">
          <MdSearch className="text-gray-500 text-xl mr-2" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="bg-transparent outline-none text-gray-700 w-52"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div>
          <select
            className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold cursor-pointer shadow-inner focus:outline-none"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="name">Par Nom</option>
            <option value="email">Par Email</option>
          </select>
        </div>

        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-2 bg-[#cfc6c4] hover:bg-[#bfb4b0] rounded-2xl px-6 py-2 text-[17px] font-semibold text-black transition duration-200 focus:outline-none focus:ring-2 focus:ring-[#a89f9c]"
        >
          Exporter en CSV <MdFileDownload />
        </button>
      </div>

      <div className="flex-1 overflow-auto bg-white shadow-2xl rounded-2xl p-4">
        {filteredData.length === 0 ? (
          <p className="text-center text-lg py-5 text-gray-600">
            Aucun organisateur correspondant
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[600px]">
              <thead className="bg-gray-100 border-b border-gray-300">
                <tr>
                  <th className="py-3 px-6 text-start font-semibold text-gray-700">
                    Nom
                  </th>
                  <th className="py-3 px-6 text-start font-semibold text-gray-700">
                    Email
                  </th>
                  <th className="py-3 px-6 text-start font-semibold text-gray-700">
                    Date de création
                  </th>
                  <th className="py-3 px-6 text-center font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredData.map((organisateur, index) => (
                    <motion.tr
                      key={organisateur.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="py-3 px-6">{organisateur.name}</td>
                      <td className="py-3 px-6">{organisateur.email}</td>
                      <td className="py-3 px-6">
                        {formatDate(organisateur.createdAt)}
                      </td>
                      <td className="py-3 px-6 text-center flex justify-center gap-2 items-center">
                        <button
                          onClick={() => {
                            handleTakeManagerEvents(organisateur.id);
                            setManagerName(organisateur.name);
                          }}
                          className="bg-[#cfc6c4] hover:bg-[#bfb4b0] px-4 py-1 rounded-2xl font-semibold text-black transition duration-200 focus:outline-none focus:ring-2 focus:ring-[#a89f9c]"
                        >
                          Ses événements
                        </button>
                        <button
                          onClick={() => openDeleteModal(organisateur)}
                          className="text-red-600 hover:text-red-800 text-2xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 rounded"
                        >
                          <TbTrashXFilled />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        {/* Modals */}
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
