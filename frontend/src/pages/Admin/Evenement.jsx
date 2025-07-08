import { useEffect, useState } from "react";
import ModalEvenement from "./ModalEvenement";
import { getAllEvents } from "../../services/evenementServ";
import { FaEye } from "react-icons/fa";
import { MdCalendarToday } from "react-icons/md";

// Helper function to format date
export const formatDate = (dateString) => {
  if (!dateString) return ''; // Handle cases where date might be missing
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

export default function EvenementAd() {
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllEvents();
        setData(data);
        console.log(data);
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

  return (
    <div  className="p-8 bg-white my-2 rounded-2xl shadow-2xl border border-gray-200">
      <div>
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-b border-gray-200 pb-4 flex items-center">
            <MdCalendarToday className="mr-3" /> Liste des événements
        </h2>
      </div>
      <div className="flex justify-center items-center pt-5">
        <div className="bg-white shadow-2xl rounded-2xl p-4 overflow-y-auto">
          {loading && (
            <p className="text-center text-lg py-5">Chargement des événements...</p>
          )}
          {error && (
            <p className="text-center text-lg py-5 text-red-600">{error}</p>
          )}
          {!loading && !error && data.length === 0 && (
            <p className="text-center text-lg py-5">Aucun événement disponible.</p>
          )}
          {!loading && !error && data.length > 0 && (
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
                {data.map((value, key) => (
                  <tr key={key}>
                    <td className="p-3 text-start ">{value.nom}</td>
                    <td className="p-3 text-start ">{value.type}</td>
                    <td className="p-3 text-start ">{value.theme}</td>
                    <td className="p-3 text-start ">{formatDate(value.date)}</td> {/* Applied formatting here */}
                    <td className="p-3 text-start ">{formatDate(value.date_fin)}</td> {/* Applied formatting here */}
                    <td className="p-3 text-start ">{value.location.nom}</td>
                    <td className="p-3 text-start ">{value.user.name}</td>
                    <td>
                      <button
                        className="py-2 px-4  text-black font-semibold rounded-2xl border-none text-start  bg-[#cfc6c4] cursor-pointer hover:bg-[#c2bab8] transition duration-200"
                        onClick={() => openModal(key)}
                      >
                        Détail <FaEye className="ml-1 mb-1 inline"/>
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