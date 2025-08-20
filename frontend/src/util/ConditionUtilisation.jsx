import React, { useState } from 'react';
import { FaUser, FaFileContract, FaShieldAlt, FaGavel, FaHandshake } from 'react-icons/fa';

const Image1 = "https://picsum.photos/id/1011/400/250";
const Image2 = "https://picsum.photos/id/1012/400/250";
const Image3 = "https://picsum.photos/id/1013/400/250";
const Image4 = "https://picsum.photos/id/1015/400/250";
const Image5 = "https://picsum.photos/id/1016/400/250";

const Modal = ({ isOpen, onClose, icon, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="relative bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-indigo-600 text-2xl"
        >
          &times;
        </button>
        <div className="flex items-center gap-4 mb-6">
          <div className="text-indigo-600">{icon}</div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        </div>
        <div className="text-gray-700">{children}</div>
      </div>
    </div>
  );
};

const ConditionsUtilisation = ({ isOpen, onClose }) => {
  const [modalContent, setModalContent] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [modalIcon, setModalIcon] = useState(null);

  const sections = [
    {
      title: "Acceptation des conditions",
      icon: <FaUser size={28} />,
      image: Image1,
      fullText: "En utilisant cette plateforme, vous acceptez nos conditions...",
    },
    {
      title: "Utilisation du service",
      icon: <FaFileContract size={28} />,
      image: Image2,
      fullText: "Vous devez utiliser ce service de manière légale et respectueuse...",
    },
    {
      title: "Propriété intellectuelle",
      icon: <FaShieldAlt size={28} />,
      image: Image3,
      fullText: "Tout le contenu est protégé par les lois sur la propriété intellectuelle...",
    },
    {
      title: "Responsabilité et limitations",
      icon: <FaGavel size={28} />,
      image: Image4,
      fullText: "Nous ne sommes pas responsables des dommages indirects liés à l’utilisation du service...",
    },
    {
      title: "Résiliation et suspension",
      icon: <FaHandshake size={28} />,
      image: Image5,
      fullText: "Nous pouvons suspendre ou résilier votre accès en cas de non-respect des règles...",
    },
  ];

  const openModal = (section) => {
    setModalTitle(section.title);
    setModalContent(section.fullText);
    setModalIcon(section.icon);
  };

  const closeModal = () => {
    setModalContent('');
    setModalTitle('');
    setModalIcon(null);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} icon={modalIcon} title={modalTitle}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sections.map((section, idx) => (
          <div
            key={idx}
            className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition cursor-pointer"
            onClick={() => openModal(section)}
          >
            <div className="flex items-center gap-2 mb-2">
              {section.icon}
              <h3 className="font-semibold text-lg">{section.title}</h3>
            </div>
            <img
              src={section.image}
              alt={section.title}
              className="rounded-lg mb-3 w-full h-40 object-cover"
            />
            <p className="text-sm text-gray-600">{section.fullText.substring(0, 80)}...</p>
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default ConditionsUtilisation;
