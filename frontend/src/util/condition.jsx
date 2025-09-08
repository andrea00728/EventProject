import React, { useState } from 'react';
import { FaUser, FaFileContract, FaShieldAlt, FaGavel, FaHandshake } from 'react-icons/fa';

const SECTIONS_DATA = [
  {
    title: "Acceptation des conditions",
    icon: <FaUser size={28} />,
    image: "https://picsum.photos/id/1011/400/250",
    fullText: "En utilisant cette plateforme, vous acceptez nos conditions d’utilisation. Ces conditions régissent votre accès et votre utilisation de tous les services, contenus et fonctionnalités de la plateforme. Si vous n'êtes pas d'accord avec ces conditions, veuillez ne pas utiliser notre service. Nous nous réservons le droit de modifier ces conditions à tout moment et sans préavis. Votre utilisation continue de la plateforme après de telles modifications constitue votre acceptation des nouvelles conditions."
  },
  {
    title: "Utilisation du service",
    icon: <FaFileContract size={28} />,
    image: "https://picsum.photos/id/1012/400/250",
    fullText: "Vous devez utiliser ce service de manière légale et respectueuse. Vous vous engagez à ne pas utiliser la plateforme pour des activités illégales ou frauduleuses, à ne pas interférer avec le fonctionnement normal du site, et à ne pas violer les droits de tiers. Toute utilisation abusive ou non autorisée de la plateforme peut entraîner la suspension ou la résiliation de votre compte."
  },
  {
    title: "Propriété intellectuelle",
    icon: <FaShieldAlt size={28} />,
    image: "https://picsum.photos/id/1013/400/250",
    fullText: "Tout le contenu de la plateforme, y compris les textes, graphiques, logos, images et logiciels, est protégé par les lois sur la propriété intellectuelle. Vous ne pouvez pas copier, modifier, distribuer ou utiliser ce contenu sans autorisation écrite de notre part. Le respect de ces droits est une condition essentielle de votre utilisation de la plateforme."
  },
  {
    title: "Responsabilité et limitations",
    icon: <FaGavel size={28} />,
    image: "https://picsum.photos/id/1015/400/250",
    fullText: "Nous ne sommes pas responsables des dommages indirects liés à l’utilisation du service. La plateforme est fournie 'telle quelle', sans aucune garantie de disponibilité ou de performance. Bien que nous nous efforcions de maintenir le service en bon état de fonctionnement, nous ne pouvons pas garantir une absence totale d’interruptions ou d’erreurs. Votre utilisation de la plateforme se fait à vos propres risques."
  },
  {
    title: "Résiliation et suspension",
    icon: <FaHandshake size={28} />,
    image: "https://picsum.photos/id/1016/400/250",
    fullText: "Nous pouvons suspendre ou résilier votre accès en cas de non-respect des règles. Nous nous réservons le droit de prendre cette décision à notre seule discrétion, si nous estimons que vous avez violé les conditions d’utilisation ou que votre comportement est préjudiciable à la plateforme ou à d’autres utilisateurs. Une telle résiliation peut se faire sans préavis."
  },
];

// Composant de la modale réutilisable
const Modal = ({ isOpen, onClose, children, title, icon }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="relative bg-white rounded-2xl p-8 max-w-4xl w-full mx-auto shadow-xl transform transition-all scale-100 opacity-100 animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-indigo-600 text-3xl font-light"
          aria-label="Fermer"
        >
          &times;
        </button>
        <div className="flex items-center gap-4 mb-6">
          {icon && <div className="text-indigo-600">{icon}</div>}
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        </div>
        <div className="text-gray-700 max-h-[80vh] overflow-y-auto pr-2">
          {children}
        </div>
      </div>
    </div>
  );
};

// Composant principal des conditions d'utilisation
const ConditionsUtilisation = ({ isOpen, onClose }) => {
  const [selectedSection, setSelectedSection] = useState(null);

  const openSectionModal = (section) => {
    setSelectedSection(section);
  };

  const closeSectionModal = () => {
    setSelectedSection(null);
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal isOpen={isOpen && !selectedSection} onClose={onClose} title="Conditions Générales d'Utilisation">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SECTIONS_DATA.map((section, idx) => (
            <div
              key={idx}
              className="bg-gray-50 p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
              onClick={() => openSectionModal(section)}
            >
              <div className="flex flex-col items-center justify-center text-center">
                <div className="text-indigo-600 mb-4">{section.icon}</div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">{section.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {section.fullText.substring(0, 100)}...
                </p>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      {/* Modale de la section sélectionnée */}
      <Modal
        isOpen={!!selectedSection}
        onClose={closeSectionModal}
        icon={selectedSection?.icon}
        title={selectedSection?.title}
      >
        <div className="flex flex-col items-center">
          <img
            src={selectedSection?.image}
            alt={selectedSection?.title}
            className="rounded-xl mb-6 w-full h-auto object-cover max-h-64"
          />
          <p className="text-base text-gray-800 leading-relaxed text-justify">
            {selectedSection?.fullText}
          </p>
        </div>
      </Modal>
    </>
  );
};

export default ConditionsUtilisation;
