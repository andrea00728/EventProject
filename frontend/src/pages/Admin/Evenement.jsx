import { useEffect, useState } from "react";
import ModalAdmin from "./ModalAdmin";
import { getAllEvents } from "../../services/evenementServ";

export default function EvenementAd() {
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState({})
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getAllEvents();
        setData(data);
        console.log(data);
      } catch (error) {
        console.log("Erreur : ", error);
      }
    };
    fetchEvents();
  }, []);

  const openModal = (key) => {
    setModalData(data[0])
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setModalData({})
    setIsModalOpen(false);
  };
  return (
    <div>
      <div className="grid grid-cols-3 items-center">
        <h2 className="text-2xl  py-3 pl-3 text-start font-semibold">
          Liste des événements
        </h2>
        {/* <div className="relative">
          <input type="text" className="px-6 py-2 mt-8 rounded-2xl shadow-lg" placeholder="Recherche ... " />
          <MdSearch className="text-2xl mx-0 relative bottom-8 left-[30vh]" />
        </div> */}
      </div>
      <div className="flex justify-center items-center pt-5">
        <div className="bg-white shadow-2xl rounded-2xl p-4 overflow-y-auto">
          <table>
            <thead>
              <tr>
                <th className="p-3 text-start">Nom</th>
                <th className="p-3 text-start">Type</th>
                <th className="p-3 text-start">Thème</th>
                <th className="p-3 text-start">Date début</th>
                <th className="p-3 text-start">Date fin</th>
                <th className="p-3 text-start">Localisation</th>
                <th className="p-3 text-start">Organisateur</th>
                <th className="p-3 text-start">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((value, key) => (
                <tr key={key}>
                  <td className="p-3 text-start">{value.nom}</td>
                  <td className="p-3 text-start">{value.type}</td>
                  <td className="p-3 text-start">{value.theme}</td>
                  <td className="p-3 text-start">{value.date}</td>
                  <td className="p-3 text-start">{value.date_fin}</td>
                  <td className="p-3 text-start">{value.location.nom}</td>
                  <td className="p-3 text-start">{value.user.name}</td>
                  <td>
                    <button className="p-3 text-start text-blue-600 cursor-pointer hover:text-blue-800 transition duration-200" onClick={()=> openModal(key)}>Détails </button>
                  </td>
                </tr>
              ))}
              <ModalAdmin
                isOpen={isModalOpen}
                onClose={closeModal}
                data={modalData}
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}