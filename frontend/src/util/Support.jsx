import React from 'react';
import { FaLifeRing, FaPhone, FaEnvelope } from 'react-icons/fa';

export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="relative bg-white rounded-2xl p-8 max-w-3xl w-full mx-4 shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-indigo-600 text-2xl"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
        <div className="text-gray-700">{children}</div>
      </div>
    </div>
  );
};

const Support = ({ isOpen, onClose }) => {
  const supportInfo = [
    {
      icon: <FaPhone size={24} className="text-indigo-600" />,
      title: "Support téléphonique",
      text: "Appelez-nous au +33 1 23 45 67 89 pour toute question urgente.",
    },
    {
      icon: <FaEnvelope size={24} className="text-indigo-600" />,
      title: "Support par email",
      text: "Envoyez un email à support@rapexgroup.com et nous vous répondrons sous 24h.",
    },
    {
      icon: <FaLifeRing size={24} className="text-indigo-600" />,
      title: "FAQ & Assistance",
      text: "Consultez notre FAQ pour des réponses rapides à vos questions courantes.",
    },
  ];

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Support Rapex Group">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {supportInfo.map((item, idx) => (
          <div key={idx} className="bg-gray-50 p-4 rounded-xl shadow hover:shadow-lg transition cursor-pointer">
            <div className="flex items-center gap-2 mb-2">
              {item.icon}
              <h3 className="font-semibold text-lg">{item.title}</h3>
            </div>
            <p className="text-gray-600 text-sm">{item.text}</p>
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default Support;