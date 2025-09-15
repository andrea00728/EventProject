import React, { useState } from "react";
import { FaFacebook, FaInstagram, FaPhone } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import ConditionsUtilisation from "../util/condition";
import Support from "../util/Support";

// Icons pour la politique de confidentialité
import { FaDatabase, FaTable, FaShare } from 'react-icons/fa';
import { MdOutlineSecurity } from "react-icons/md";
import { LuUserCheck } from "react-icons/lu";
import LogoRG from "../assets/LogoRapexGroup.png"

// Données des sections de la politique de confidentialité
const SECTIONS_DATA = [
  {
    id: "informations-collectees",
    title: "Informations collectées",
    icon: <FaDatabase size={32} />,
    fullText: `
      Nous pouvons collecter différents types d'informations vous concernant, y compris :

      **Informations personnelles identifiables (IPI)** : Lors de l'inscription/création de compte : Nom, prénom, adresse e-mail, numéro de téléphone, mot de passe.
      
      **Lors de la création ou de la participation à un événement** : Informations de paiement (via des processeurs tiers sécurisés), adresse de facturation, informations spécifiques à l'événement (par exemple, préférences alimentaires, informations sur les invités).

      **Informations de profil** : Photo de profil (si fournie), organisation, titre.
      
      **Données d'utilisation** : Informations sur la manière dont vous accédez et utilisez le Service (par exemple, adresses IP, types de navigateur, pages visitées, temps passé sur les pages, chemins de navigation).
    `
  },
  {
    id: "utilisation-informations",
    title: "Utilisation des informations",
    icon: <FaTable size={32} />,
    fullText: `
      Nous utilisons les informations collectées à diverses fins :
      
      **Fournir et maintenir le Service** : Créer et gérer votre compte, traiter les paiements, héberger vos événements, gérer les inscriptions.

      **Améliorer et personnaliser le Service** : Comprendre vos préférences, améliorer les fonctionnalités, personnaliser votre expérience utilisateur.

      **Communiquer avec vous** : Envoyer des notifications relatives à votre compte ou à vos événements (confirmations d'inscription, mises à jour, rappels), répondre à vos demandes de support, vous informer des nouvelles fonctionnalités ou offres.
    `
  },
  {
    id: "partage-divulgation",
    title: "Partage et divulgation",
    icon: <FaShare size={32} />,
    fullText: `
      Nous ne vendons ni ne louons vos informations personnelles à des tiers. Nous pouvons partager vos informations dans les situations suivantes :

      **Avec les organisateurs d'événements** : Si vous êtes un participant, les informations nécessaires à votre inscription et à votre participation (nom, e-mail, réponses aux questions personnalisées de l'événement) seront partagées avec l'organisateur de l'événement concerné.

      **Avec les participants à un événement** : Si vous êtes un organisateur, certaines informations sur les participants (selon les paramètres de confidentialité de l'événement) peuvent être visibles par les autres participants (par exemple, nom et photo de profil).
    `
  },
  {
    id: "securite-donnees",
    title: "Sécurité des données",
    icon: <MdOutlineSecurity size={32} />,
    fullText: `
      Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos informations personnelles contre l'accès non autorisé, la divulgation, l'altération ou la destruction.
    `
  },
  {
    id: "vos-droits",
    title: "Vos droits",
    icon: <LuUserCheck size={32} />,
    fullText: `
      Conformément à la législation applicable sur la protection des données, vous disposez de certains droits concernant vos informations personnelles :

      **Droit d'accès** : Vous avez le droit de demander une copie des informations personnelles que nous détenons à votre sujet.

      **Droit de rectification** : Vous avez le droit de demander la correction de toute information personnelle incomplète ou inexacte vous concernant.
    `
  }
];

// Composant Modal (pour le texte complet)
const Modal = ({ isOpen, onClose, icon, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative bg-white/90 backdrop-blur-md rounded-3xl p-8 max-w-xl w-full mx-4 max-h-[60vh] overflow-y-auto shadow-2xl border border-white/20 transform scale-100 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {icon}
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 text-3xl font-light transition-colors"
            aria-label="Fermer"
          >
            &times;
          </button>
        </div>
        <div className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">{children}</div>
      </div>
    </div>
  );
};

// Composant de la politique de confidentialité
const PolitiqueConfidentialite = ({ isOpen, onClose }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    content: null,
    title: '',
    icon: null,
  });

  const openModal = (section) => {
    setModalState({
      isOpen: true,
      content: section.fullText,
      title: section.title,
      icon: React.cloneElement(section.icon, { className: 'text-indigo-600' }),
    });
  };

  const closeModal = () => {
    setModalState(prevState => ({ ...prevState, isOpen: false }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40">
      <div className="relative max-w-6xl mx-auto my-12 bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-h-[70vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-center text-4xl font-extrabold text-indigo-900 drop-shadow-lg">
            Politique de confidentialité
          </h1>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900 text-3xl font-light transition-colors" aria-label="Fermer">
            &times;
          </button>
        </div>
        <p className="text-center text-lg text-gray-600 font-medium max-w-3xl mx-auto mb-12 leading-relaxed">
          Votre vie privée est notre priorité. Cette politique explique comment vos informations sont collectées et gérées sur notre plateforme.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SECTIONS_DATA.map((section) => (
            <div
              key={section.id}
              className="bg-white/70 rounded-3xl shadow-lg p-8 flex flex-col items-center text-center transition-transform duration-300 hover:scale-105 hover:shadow-xl backdrop-blur-sm"
            >
              <div className="text-indigo-600 mb-6">
                {section.icon}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {section.title}
              </h2>
              <p className="text-gray-600 text-base leading-relaxed whitespace-pre-line text-left flex-grow">
                {section.fullText.substring(0, 150)}...
              </p>
              <button
                onClick={() => openModal(section)}
                className="mt-6 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-full shadow-md hover:bg-indigo-700 transition-colors"
              >
                Voir plus
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Le composant Modal pour les détails est ici */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        icon={modalState.icon}
        title={modalState.title}
      >
        {modalState.content}
      </Modal>
    </div>
  );
};

// Composant Footer mis à jour
function Footer() {
  const [showConfidentialite, setShowConfidentialite] = useState(false);
  const [showConditions, setShowConditions] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  return (
    <>
      <footer className="relative bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 text-white py-10 overflow-hidden">
        {/* ... (le reste de votre code de pied de page) ... */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-[#FB9E3A]/10 to-orange-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-gradient-to-l from-indigo-400/15 to-purple-400/10 rounded-full blur-2xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-violet-300/5 to-fuchsia-300/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto max-w-screen relative z-10 px-6">
          <div className="text-center mb-20 space-y-6">
            <div className="container mx-auto max-w-7xl relative z-10">
              <div className="text-center mb-16 space-y-6">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm font-medium text-white/90 shadow-sm">
                  <div className="w-2 h-2 bg-[#FB9E3A] rounded-full animate-pulse"></div>
                  Restons connectés
                </div>
                <h2 className="text-4xl lg:text-5xl font-black text-white leading-[1.1] tracking-tight">
                  Prêt à organiser votre
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FB9E3A] via-orange-400 to-amber-400 drop-shadow-sm">
                    prochain événement ?
                  </span>
                </h2>
              </div>
              <div className="bg-gradient-to-r from-[#FB9E3A]/10 to-orange-400/10 backdrop-blur-sm rounded-3xl p-8 border border-orange-400/20 mb-16">
                <div className="text-center space-y-6">
                  <h3 className="text-2xl font-black text-white">
                    Restez informé de nos dernières actualités
                  </h3>
                  <p className="text-slate-300 xl:text-lg">
                    Recevez nos conseils d'organisation et les dernières tendances événementielles
                  </p>
                  <div className="flex justify-center gap-6 pt-4">
                    <a href="tel:+33123456789" className="group w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center hover:bg-green-500/20 hover:border-green-400/30 border border-white/20 transition-all duration-300 hover:scale-110">
                      <FaPhone className="w-5 h-5 text-white group-hover:text-green-400 transition-colors" />
                    </a>
                    <a href="mailto:mastertable37@gmail.com" className="group w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center hover:bg-blue-500/20 hover:border-blue-400/30 border border-white/20 transition-all duration-300 hover:scale-110">
                      <MdEmail className="w-5 h-5 text-white group-hover:text-blue-400 transition-colors" />
                    </a>
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="group w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center hover:bg-blue-600/20 hover:border-blue-500/30 border border-white/20 transition-all duration-300 hover:scale-110">
                      <FaFacebook className="w-5 h-5 text-white group-hover:text-blue-500 transition-colors" />
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="group w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center hover:bg-gradient-to-r hover:from-pink-500/20 hover:to-purple-500/20 hover:border-pink-400/30 border border-white/20 transition-all duration-300 hover:scale-110">
                      <FaInstagram className="w-5 h-5 text-white group-hover:text-pink-400 transition-colors" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 w-30 h-auto">
                  {/* <div className="w-8 h-8 bg-gradient-to-br from-[#FB9E3A] to-orange-400 rounded-xl flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div> */}
                  <span className="text-xl font-black text-white"><img src={LogoRG} alt="Logo" className="w-30 h-auto object-cover" /></span>
                </div>
                <p className="text-slate-400 text-sm">© 2025. Tous droits réservés</p>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <button
                  onClick={() => setShowConfidentialite(true)}
                  className="text-slate-400 hover:text-white transition-colors hover:underline"
                >
                  Politique de confidentialité
                </button>
                <button
                  onClick={() => setShowConditions(true)}
                  className="text-slate-400 hover:text-white transition-colors hover:underline"
                >
                  Conditions d'utilisation
                </button>
                <button
                  onClick={() => setShowSupport(true)} 
                  className="text-slate-400 hover:text-white transition-colors hover:underline"
                >
                  Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Modales */}
      <PolitiqueConfidentialite
        isOpen={showConfidentialite}
        onClose={() => setShowConfidentialite(false)}
      />

      <ConditionsUtilisation
        isOpen={showConditions}
        onClose={() => setShowConditions(false)}
      />

      <Support
        isOpen={showSupport}
        onClose={() => setShowSupport(false)}
      />
    </>
  );
}

export default Footer;