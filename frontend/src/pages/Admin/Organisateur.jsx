import { useEffect, useState } from "react";
import { deleteManager, getManagerList } from "../../services/inviteService";
import { formatDate } from "./Evenement";
import { MdFileDownload } from "react-icons/md";
import { TbTrashXFilled } from "react-icons/tb";
import { getAllManagerEvents } from "../../services/evenementServ";
import ModalManager from "./ModalManager";
import DeleteModal from "./DeleteModal";
import { FaUsers } from "react-icons/fa6";

export default function Organisateur() {
  const [data, setData] = useState([]);
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
        console.log(data);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des organisateurs :",
          error
        );
      }
    };
    fetchData();
  }, []);

  const handleTakeManagerEvents = async (id) => {
    try {
      const data = await getAllManagerEvents(id);
      if (data.length === 0) {
        alert("Aucun événement trouvé pour cet organisateur.");
        return;
      } else {
        openModal();
        console.log(data);
        setModalData(data);
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des événements de l'organisateur :",
        error
      );
      return;
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setModalData([]);
    setManagerName("");
    setIsModalOpen(false);
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
      const response = await deleteManager(selectedManager.id);
      console.log("Organisateur supprimé :", response);
      closeDeleteModal();
      // Mets à jour la liste
      setData((prev) => prev.filter((m) => m.id !== selectedManager.id));
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
    }
  };

  return (
    <div className="p-8 my-2 bg-white rounded-2xl shadow-2xl border border-gray-200">
      <div>
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-b border-gray-200 pb-4 flex items-center">
            <FaUsers className="mr-3" /> Liste des organisateurs
        </h2>
      </div>
      <div className="flex justify-end">
        <button className="bg-[#cfc6c4] hover:bg-[#c2bab8] rounded-2xl px-6 py-2 text-[17px] text-black transition duration-200 font-semibold cursor-pointer">
          Exporter en CSV <MdFileDownload className="inline ml-2" />
        </button>
      </div>
      <div className="flex justify-center items-center pt-5">
        <div className="bg-white shadow-2xl rounded-2xl p-4 overflow-y-auto">
          {data.length === 0 && (
            <p className="text-center text-lg py-5">
              Aucun organisateur disponible{" "}
            </p>
          )}
          {data.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th className="py-3 px-8 text-start font-semibold">Nom</th>
                  <th className="py-3 px-8 text-start font-semibold">Email</th>
                  <th className="py-3 px-8 text-start font-semibold">
                    Date de création
                  </th>
                  {/* <th className="p-3 text-start font-semibold">Photo</th> */}
                  <th className="py-3 px-8 text-center font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((organisateur, index) => (
                  <tr key={index}>
                    <td className="py-3 px-8 text-start">
                      {organisateur.name}
                    </td>
                    <td className="py-3 px-8 text-start">
                      {organisateur.email}
                    </td>
                    <td className="py-3 px-8 text-start">
                      {formatDate(organisateur.createdAt)}
                    </td>
                    {/* <td className="py-3 px-8 text-start">
                        <img
                          src={organisateur.photo || "default-avatar.png"}
                          alt="Organisateur"
                          className="w-10 h-10 rounded-full"
                        />
                      </td> */}
                    <td className="py-3 px-8 text-start">
                      <button
                        onClick={() => {
                          handleTakeManagerEvents(organisateur.id);
                          setManagerName(organisateur.name);
                        }}
                        className="py-2 px-4  text-black cursor-pointer font-semibold rounded-2xl text-start  bg-[#cfc6c4] hover:bg-[#c2bab8] transition duration-200"
                      >
                        Ses événements
                      </button>
                      <button
                        onClick={() => openDeleteModal(organisateur)}
                        className="mx-2 text-2xl text-red-600 hover:text-red-800 cursor-pointer"
                      >
                        <TbTrashXFilled className="inline-block" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <ModalManager
            isOpen={isModalOpen}
            onClose={closeModal}
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
    </div>
  );
}
