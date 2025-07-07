import { useEffect, useState } from "react";
import { getManagerList } from "../../services/inviteService";
import { formatDate } from "./Evenement";
import { MdFileDownload } from "react-icons/md";
import { TbTrashXFilled } from "react-icons/tb";
import { getAllManagerEvents } from "../../services/evenementServ";
import ModalManager from "./ModalManager";

export default function Organisateur() {
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState({});
  const [managerName, setManagerName] = useState("");

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
      }else{
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
    setModalData({});
    setManagerName("");
    setIsModalOpen(false);
  };
  return (
    <div>
      <div>
        <h2 className="text-2xl  py-3 pl-3 text-start font-semibold">
          Liste des organisateurs
        </h2>
      </div>
      <div className="flex justify-end">
        <button className="bg-indigo-600 rounded-2xl px-6 py-2 text-[17px] text-white hover:bg-indigo-800 transition duration-200 font-semibold cursor-pointer">
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
                        className="text-blue-500 mx-2 inline-block hover:underline"
                      >
                        Ses événements
                      </button>
                      <button className="text-blue-500 mx-2 hover:underline">
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
        </div>
      </div>
    </div>
  );
}
