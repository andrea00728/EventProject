import React from 'react';
import { FaUser, FaFileContract, FaShieldAlt, FaGavel, FaHandshake } from 'react-icons/fa';

const Image1 = "https://picsum.photos/id/1011/400/250";
const Image2 = "https://picsum.photos/id/1012/400/250";
const Image3 = "https://picsum.photos/id/1013/400/250";
const Image4 = "https://picsum.photos/id/1015/400/250";
const Image5 = "https://picsum.photos/id/1016/400/250";

const ConditionsUtilisation = () => {
  const sections = [
    {
      title: "Acceptation des conditions",
      icon: <FaUser size={28} className="text-indigo-600" />,
      image: Image1,
      fullText: "En utilisant cette plateforme, vous acceptez nos conditions...",
    },
    {
      title: "Utilisation du service",
      icon: <FaFileContract size={28} className="text-indigo-600" />,
      image: Image2,
      fullText: "Vous devez utiliser ce service de manière légale et respectueuse...",
    },
    {
      title: "Propriété intellectuelle",
      icon: <FaShieldAlt size={28} className="text-indigo-600" />,
      image: Image3,
      fullText: "Tout le contenu est protégé par les lois sur la propriété intellectuelle...",
    },
    {
      title: "Responsabilité et limitations",
      icon: <FaGavel size={28} className="text-indigo-600" />,
      image: Image4,
      fullText: "Nous ne sommes pas responsables des dommages indirects liés à l’utilisation du service...",
    },
    {
      title: "Résiliation et suspension",
      icon: <FaHandshake size={28} className="text-indigo-600" />,
      image: Image5,
      fullText: "Nous pouvons suspendre ou résilier votre accès en cas de non-respect des règles...",
    },
  ];

  return (
    <section className="py-16 px-4 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold text-center text-indigo-900 mb-12">
        Conditions d'utilisation
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sections.map((section, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              {section.icon}
              <h2 className="text-2xl font-semibold text-gray-900">{section.title}</h2>
            </div>
            <img
              src={section.image}
              alt={section.title}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <p className="text-gray-700 text-lg leading-relaxed">{section.fullText}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ConditionsUtilisation;