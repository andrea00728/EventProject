import React, { useEffect, useState } from "react";
import { FaGears, FaUsers, FaUser } from "react-icons/fa6";
import {
  MdDashboard,
  MdCalendarToday,
  MdOutlineCalendarMonth,
  MdOutlineCalendarToday,
  MdVerifiedUser,
  MdAttachMoney,
  MdSearch,MdFileDownload, MdStars, MdLocationCity, MdRoom, MdQrCode, MdStarBorderPurple500
} from "react-icons/md";
import { formatDate } from "./Evenement";

const ModalEvenement = ({ isOpen, onClose, data }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full h-screen mx-4 relative overflow-auto">
        {/* En-tête du modal */}
        <div className="flex justify-between items-center pb-3 border-gray-200">
          <h3 className="text-2xl font-semibold text-gray-800">
            <MdCalendarToday className="mr-3 mb-2 inline" />
            Organisé par {data.user.name}
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
        <h3
          className="text-center text-2xl font-normal my-3"
          style={{ fontFamily: "serif" }}
        >
          Evénement : {data.nom}
        </h3>

        {/* Contenu du modal */}
        <div className="py-4 overflow-y-auto">
          <div className="flex justify-center gap-10 py-5  flex-wrap">
            <div className="pt-5 px-5  rounded-2xl shadow-lg hover:translate-y-[-8px] transition duration-300">
              <h3 className="font-semibold mr-8">Type d'événement</h3>
              <div className="flex justify-between items-center pt-8 pb-3 text-start m-0">
                <span className="text-[20px]">{data.type}</span>
                <span className="text-[24px]">
                  <MdCalendarToday />
                </span>
              </div>
            </div>
            <div className="pt-5 px-5  rounded-2xl shadow-lg hover:translate-y-[-8px] transition duration-300">
              <h3 className="font-semibold mr-8">Thème de l'événement</h3>
              <div className="flex justify-between items-center pt-8 pb-3 text-start m-0">
                <span className="text-[20px]">{data.theme}</span>
                <span className="text-[24px]">
                  <MdStars />
                </span>
              </div>
            </div>
            <div className="pt-5 px-5  rounded-2xl shadow-lg hover:translate-y-[-8px] transition duration-300">
              <h3 className="font-semibold mr-8">Date de début</h3>
              <div className="flex justify-between items-center pt-8 pb-3 text-start m-0">
                <span className="text-[20px] mr-3">{formatDate(data.date)}</span>
                <span className="text-[24px]">
                  <MdOutlineCalendarMonth />
                </span>
              </div>
            </div>
            <div className="pt-5 px-5  rounded-2xl shadow-lg hover:translate-y-[-8px] transition duration-300">
              <h3 className="font-semibold mr-8">Date de fin</h3>
              <div className="flex justify-between items-center pt-8 pb-3 text-start m-0">
                <span className="text-[20px] mr-3">{formatDate(data.date_fin)}</span>
                <span className="text-[24px]">
                  <MdOutlineCalendarMonth />
                </span>
              </div>
            </div>
            <div className="pt-5 px-5  rounded-2xl shadow-lg hover:translate-y-[-8px] transition duration-300">
              <h3 className="font-semibold mr-8">Type d'abonnement</h3>
              <div className="flex justify-between items-center pt-8 pb-3 text-start m-0">
                <span className="text-[20px]">Je sais pas</span>
                <span className="text-[24px]">
                  <MdOutlineCalendarToday />
                </span>
              </div>
            </div>
            <div className="pt-5 px-5  rounded-2xl shadow-lg hover:translate-y-[-8px] transition duration-300">
              <h3 className="font-semibold mr-8">Localisation</h3>
              <div className="flex justify-between items-center pt-8 pb-3 text-start m-0">
                <span className="text-[20px]">{data.location.nom}</span>
                <span className="text-[24px]">
                  <MdRoom />
                </span>
              </div>
            </div>
            <div className="pt-5 px-5  rounded-2xl shadow-lg hover:translate-y-[-8px] transition duration-300">
              <h3 className="font-semibold mr-8">Salle</h3>
              <div className="flex justify-between items-center pt-8 pb-3 text-start m-0">
                <span className="text-[20px] mr-3">{data.salle.nom}</span>
                <span className="text-[24px]">
                  <MdLocationCity />
                </span>
              </div>
            </div>
            <div className="pt-5 px-5  rounded-2xl shadow-lg hover:translate-y-[-8px] transition duration-300">
              <h3 className="font-semibold mr-8">Nombre d'invités</h3>
              <div className="flex justify-between items-center pt-8 pb-3 text-start m-0">
                <span className="text-[20px]">{data.invites.length}</span>
                <span className="text-[24px]">
                  <FaUsers />
                </span>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button className="bg-indigo-600 rounded-2xl px-6 py-2 text-[17px] text-white hover:bg-indigo-800 transition duration-200 font-semibold cursor-pointer">
              Exporter en CSV <MdFileDownload className="inline ml-2"/>
            </button>
          </div>
          <div className="p-4 overflow-y-auto flex justify-center">
            <table>
              <thead>
                <tr>
                  <th className="p-3 text-start">Nom</th>
                  <th className="p-3 text-start">Prénom</th>
                  <th className="p-3 text-start">Email</th>
                  <th className="p-3 text-start">Sexe</th>
                  <th className="p-3 text-start">Place</th>
                  <th className="p-3 text-start">Qr Code</th>
                </tr>
              </thead>
              <tbody>
                {data.invites.map((value, key) => (
                  <tr key={key}>
                    <td className="p-3 text-start">{value.nom}</td>
                    <td className="p-3 text-start">{value.prenom}</td>
                    <td className="p-3 text-start">{value.email}</td>
                    <td className="p-3 text-start">{value.sex}</td>
                    <td className="p-3 text-start">{value.place}</td>
                    <td className="p-3 text-start text-6xl"><MdQrCode /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalEvenement;
