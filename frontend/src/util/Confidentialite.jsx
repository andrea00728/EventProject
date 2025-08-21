import React, { useState, useEffect } from 'react';
import { FaDatabase, FaTable, FaShare } from 'react-icons/fa';
import { MdOutlineSecurity, MdArrowLeft, MdArrowRight } from "react-icons/md";
import { LuUserCheck } from "react-icons/lu";
import { motion, AnimatePresence } from 'framer-motion';

// --- Importation des images ---
// Ajustez les chemins selon votre structure
import Image1 from '../assets/marketers-with-magnifier-research-marketing-opportunities-chart-marketing-research-marketing-analysis-market-opportunities-and-problems-concept-flat-modern-illustration-vector.jpg';
import Image2 from '../assets/stock-market-data-analysis-team-of-statistical-analysts-or-businesspeople-analyzing-statistical-information-trendy-illustration-vector.jpg';
import Image3 from '../assets/network-maintenance-graphic.jpg';
import Image4 from '../assets/pngtree-data-secure-people-protect-cybersecurity-picture-image_8729665.png';
import Image5 from '../assets/istockphoto-1314379517-612x612.jpg';

// --- Données des Sections de Confidentialité ---
const sections = [
    {
      id: 'collection',
      title: "Informations que nous collectons",
      icon: <FaDatabase className='text-indigo-600' size={32} />,
      image: Image1,
      fullText: `Nous pouvons collecter différents types d'informations vous concernant, y compris :\n\n**Informations personnelles identifiables (IPI)** : Lors de l'inscription/création de compte : Nom, prénom, adresse e-mail, numéro de téléphone, mot de passe.\n\n**Lors de la création ou de la participation à un événement** : Informations de paiement (via des processeurs tiers sécurisés), adresse de facturation, informations spécifiques à l'événement.\n\n**Données d'utilisation** : Informations sur la manière dont vous accédez et utilisez le Service (adresses IP, types de navigateur, pages visitées, etc.).`,
      truncatedText: `Nous pouvons collecter différents types d'informations vous concernant, y compris des informations personnelles identifiables (IPI) lors de votre inscription ou de la création d'un événement.`
    },
    {
      id: 'usage',
      title: "Comment nous utilisons vos informations",
      icon: <FaTable className='text-indigo-600' size={32} />,
      image: Image2,
      fullText: `Nous utilisons les informations collectées à diverses fins :\n\n**Fournir et maintenir le Service** : Créer et gérer votre compte, traiter les paiements, héberger vos événements.\n\n**Améliorer et personnaliser le Service** : Comprendre vos préférences, améliorer les fonctionnalités, personnaliser votre expérience.\n\n**Communiquer avec vous** : Envoyer des notifications relatives à votre compte ou à vos événements, répondre à vos demandes.\n\n**Sécurité** : Détecter et prévenir la fraude et les abus.`,
      truncatedText: `Nous utilisons vos informations pour fournir, maintenir, améliorer et personnaliser le service, ainsi que pour communiquer avec vous et garantir la sécurité de notre plateforme.`
    },
    {
      id: 'sharing',
      title: "Partage et divulgation",
      icon: <FaShare className='text-indigo-600' size={32} />,
      image: Image3,
      fullText: `Nous ne vendons ni ne louons vos informations personnelles. Nous pouvons partager vos informations dans les situations suivantes :\n\n**Avec les organisateurs d'événements** : Les informations nécessaires à votre inscription et participation.\n\n**Fournisseurs de services tiers** : Entreprises fournissant des services en notre nom (traitement des paiements, hébergement, etc.).\n\n**Obligations légales** : Si la loi l'exige ou pour protéger nos droits.`,
      truncatedText: `Nous pouvons partager vos informations avec les organisateurs d'événements, des fournisseurs de services tiers, ou si la loi l'exige, mais jamais à des fins commerciales non sollicitées.`
    },
    {
      id: 'security',
      title: "Sécurité des données",
      icon: <MdOutlineSecurity className='text-indigo-600' size={32} />,
      image: Image4,
      fullText: `Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos informations personnelles contre l'accès non autorisé, la divulgation, l'altération ou la destruction. Cependant, aucune méthode de transmission sur Internet ou de stockage électronique n'est 100% sécurisée. Par conséquent, nous ne pouvons garantir leur sécurité absolue.`,
      truncatedText: `Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos informations, bien qu'aucune méthode ne soit sécurisée à 100%.`
    },
    {
      id: 'rights',
      title: "Vos droits",
      icon: <LuUserCheck className='text-indigo-600' size={32} />,
      image: Image5,
      fullText: `Conformément à la législation applicable, vous disposez de certains droits :\n\n**Droit d'accès** : Demander une copie de vos informations.\n\n**Droit de rectification** : Corriger toute information inexacte.\n\n**Droit à l'effacement (« droit à l'oubli »)**.\n\n**Droit d'opposition** au traitement de vos informations.\n\nPour exercer ces droits, veuillez nous contacter.`,
      truncatedText: `Vous disposez de droits d'accès, de rectification, d'effacement, et d'opposition concernant vos données personnelles. Vous pouvez les exercer en nous contactant.`
    }
  ];

// --- Composant Interne : Modal ---
const Modal = ({ isOpen, onClose, section }) => {
    useEffect(() => {
      const handleEsc = (event) => {
        if (event.key === 'Escape') onClose();
      };
      if (isOpen) {
        document.addEventListener('keydown', handleEsc);
        document.body.style.overflow = 'hidden';
      }
      return () => {
        document.removeEventListener('keydown', handleEsc);
        document.body.style.overflow = 'unset';
      };
    }, [isOpen, onClose]);
  
    return (
      <AnimatePresence>
        {isOpen && section && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ y: 50, scale: 0.95, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 50, scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/90 rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/30"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  {React.cloneElement(section.icon, { size: 36 })}
                  <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{section.title}</h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-900 text-3xl font-bold transition-colors duration-200 rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-200/50"
                  aria-label="Fermer"
                >
                  &times;
                </button>
              </div>
              <div className="text-gray-700 text-lg leading-relaxed whitespace-pre-line prose max-w-none">
                {section.fullText}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
};

// --- Composant Interne : Carte de section pour le carrousel ---
const PrivacySectionCard = ({ section, onReadMore }) => (
    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
        <motion.img
            className="w-full md:w-1/2 max-w-sm rounded-2xl shadow-lg border border-indigo-100/50 transition-transform duration-300 hover:scale-105"
            src={section.image}
            alt={section.title}
            layoutId={`privacy-image-${section.id}`}
        />
        <div className="w-full md:w-1/2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
            {section.icon}
            <h3 className="font-bold text-gray-900 text-3xl tracking-tight">{section.title}</h3>
            </div>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
            {section.truncatedText}
            </p>
            <motion.button
                onClick={onReadMore}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:bg-indigo-700 transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-300"
            >
            En savoir plus
            </motion.button>
        </div>
    </div>
);


// --- Composant Principal ---

const Confidentialite = () => {
  const [[page, direction], setPage] = useState([0, 0]);
  const [selectedSection, setSelectedSection] = useState(null);

  const wrap = (min, max, value) => {
    const rangeSize = max - min;
    return ((((value - min) % rangeSize) + rangeSize) % rangeSize) + min;
  };
  
  const sectionIndex = wrap(0, sections.length, page);

  const paginate = (newDirection) => {
    setPage([page + newDirection, newDirection]);
  };
  
  const goToSection = (index) => {
    const newDirection = index > sectionIndex ? 1 : -1;
    setPage([index, newDirection]);
  };

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  return (
    // MODIFICATION ICI: min-h-screen -> h-screen
    <section className="relative py-16 px-4 sm:px-8 bg-gray-50/50 h-screen flex flex-col justify-center items-center overflow-hidden">
      <div className="w-full max-w-6xl mx-auto">
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
        >
          <h1 className="text-5xl font-extrabold text-indigo-900 mb-4 tracking-tight">
            Politique de Confidentialité
          </h1>
          <h2 className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Votre vie privée est notre priorité. Découvrez comment nous collectons, utilisons et protégeons vos informations.
          </h2>
        </motion.div>

        <div className="relative h-[550px] md:h-[450px] flex items-center justify-center">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={page}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="absolute w-full px-8 py-10 bg-white/60 backdrop-blur-md rounded-3xl shadow-xl border border-white/30"
            >
              <PrivacySectionCard 
                section={sections[sectionIndex]}
                onReadMore={() => setSelectedSection(sections[sectionIndex])}
              />
            </motion.div>
          </AnimatePresence>

          <button
            onClick={() => paginate(-1)}
            className="absolute left-0 z-10 text-4xl text-indigo-500 hover:text-indigo-700 transition-all p-2 rounded-full bg-white/70 shadow-md hover:scale-110"
            aria-label="Précédent"
          >
            <MdArrowLeft />
          </button>
          <button
            onClick={() => paginate(1)}
            className="absolute right-0 z-10 text-4xl text-indigo-500 hover:text-indigo-700 transition-all p-2 rounded-full bg-white/70 shadow-md hover:scale-110"
            aria-label="Suivant"
          >
            <MdArrowRight />
          </button>
        </div>
        
        <div className="flex justify-center gap-3 mt-8">
            {sections.map((_, i) => (
                <button
                    key={i}
                    onClick={() => goToSection(i)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${sectionIndex === i ? 'bg-indigo-600 scale-125' : 'bg-indigo-200 hover:bg-indigo-400'}`}
                    aria-label={`Aller à la section ${i + 1}`}
                />
            ))}
        </div>
      </div>

      <Modal 
        isOpen={!!selectedSection}
        onClose={() => setSelectedSection(null)}
        section={selectedSection}
      />
    </section>
  );
};

export default Confidentialite;