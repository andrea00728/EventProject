import React, { useEffect, useState } from "react";
import { FaGears, FaUsers, FaUser } from "react-icons/fa6";
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
} from "react-icons/md";
import { formatDate } from "./Evenement";
import ModalEvenement from "./ModalEvenement";
import { FaEye } from "react-icons/fa";

const ModalManager = ({ isOpen, onClose, data, managerName }) => {

  if (!isOpen) return null;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState({});

  const openModal = (key) => {
    setModalData(data[key]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setModalData({});
    setIsModalOpen(false);
  };
  return (
    <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full h-screen mx-4 relative overflow-auto">
        {/* En-tête du modal */}
        <div className="flex justify-between items-center pb-3 border-gray-200">
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

        {/* Contenu du modal */}
        <div className="py-4 overflow-y-auto">
          <div className="flex justify-end">
            <button className="bg-[#cfc6c4] hover:bg-[#c2bab8] rounded-2xl px-6 py-2 text-[17px] text-black  transition duration-200 font-semibold cursor-pointer">
              Exporter en CSV <MdFileDownload className="inline ml-2" />
            </button>
          </div>
          <div className="p-4 overflow-y-auto flex justify-center">
            <table>
              <thead>
                <tr>
                  <th className="p-3 text-start font-semibold">Nom</th>
                  <th className="p-3 text-start font-semibold">Type</th>
                  <th className="p-3 text-start font-semibold">Thème</th>
                  <th className="p-3 text-start font-semibold">Date début</th>
                  <th className="p-3 text-start font-semibold">Date fin</th>
                  <th className="p-3 text-start font-semibold">Localisation</th>
                  <th className="p-3 text-center font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.map((value, key) => (
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
                    <td>
                      <button
                        className="py-2 px-4  text-black font-semibold rounded-2xl text-start  bg-[#cfc6c4] hover:bg-[#c2bab8] cursor-pointer transition duration-200"
                        onClick={() => openModal(key)}
                      >
                        Détail <FaEye className="ml-1 mb-1 inline"/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <ModalEvenement
              isOpen={isModalOpen}
              onClose={closeModal}
              data={modalData}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalManager;
