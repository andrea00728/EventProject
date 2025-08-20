import React, { useState } from 'react';
import { FaDatabase, FaTable, FaShare } from 'react-icons/fa';
import { MdOutlineSecurity, MdArrowLeft, MdArrowRight } from "react-icons/md";
import { LuUserCheck } from "react-icons/lu";

// Importation explicite des images (ajustez les chemins selon votre structure)
import Image1 from '../assets/marketers-with-magnifier-research-marketing-opportunities-chart-marketing-research-marketing-analysis-market-opportunities-and-problems-concept-flat-modern-illustration-vector.jpg';
import Image2 from '../assets/stock-market-data-analysis-team-of-statistical-analysts-or-businesspeople-analyzing-statistical-information-trendy-illustration-vector.jpg';
import Image3 from '../assets/network-maintenance-graphic.jpg';
import Image4 from '../assets/pngtree-data-secure-people-protect-cybersecurity-picture-image_8729665.png';
import Image5 from '../assets/istockphoto-1314379517-612x612.jpg';

// Composant Modal avec effet de verre dépoli
const Modal = ({ isOpen, onClose, icon, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 max-w-3xl w-full mx-4 max-h-[85vh] overflow-y-auto shadow-2xl border border-white/20 transition-transform duration-300 scale-100 hover:scale-[1.02]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {icon}
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 text-2xl font-bold transition-colors duration-200"
            aria-label="Fermer"
          >
            &times;
          </button>
        </div>
        <div className="text-gray-700 text-lg leading-relaxed">{children}</div>
      </div>
    </div>
  );
};

const Confidentialite = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [modalIcon, setModalIcon] = useState(null);
  const [index, setIndex] = useState(0);

  const sections = [
    {
      title: "Informations que nous collectons",
      icon: <FaDatabase className='mr-2 mb-1 inline text-indigo-600' size={32} />,
      image: Image1,
      fullText: `
Nous pouvons collecter différents types d'informations vous concernant, y compris :

**Informations personnelles identifiables (IPI)** : Lors de l'inscription/création de compte : Nom, prénom, adresse e-mail, numéro de téléphone, mot de passe.

**Lors de la création ou de la participation à un événement** : Informations de paiement (via des processeurs tiers sécurisés), adresse de facturation, informations spécifiques à l'événement (par exemple, préférences alimentaires, informations sur les invités).

**Informations de profil** : Photo de profil (si fournie), organisation, titre. 

**Données d'utilisation** : Informations sur la manière dont vous accédez et utilisez le Service (par exemple, adresses IP, types de navigateur, pages visitées, temps passé sur les pages, chemins de navigation).

**Données relatives aux événements** : Nombre d'inscriptions, interactions avec les fonctionnalités pour les événements que vous créez, gérez ou auxquels vous participez.

**Données de communication** : Contenu des messages que vous envoyez via notre plateforme (par exemple, messages aux organisateurs ou aux participants).

**Historique de support** : Historique de vos interactions avec notre support client.

**Cookies et technologies similaires** : Nous utilisons des cookies et des balises web pour suivre l'activité sur notre Service et conserver certaines informations. Les cookies sont de petits fichiers de données placés sur votre appareil.
      `,
      truncatedText: `
Nous pouvons collecter différents types d'informations vous concernant, y compris :

**Informations personnelles identifiables (IPI)** : Lors de l'inscription/création de compte : Nom, prénom, adresse e-mail, numéro de téléphone, mot de passe.
      `
    },
    {
      title: "Comment nous utilisons vos informations",
      icon: <FaTable className='mr-2 mb-1 inline text-indigo-600' size={32} />,
      image: Image2,
      fullText: `
Nous utilisons les informations collectées à diverses fins :

**Fournir et maintenir le Service** : Créer et gérer votre compte, traiter les paiements, héberger vos événements, gérer les inscriptions.

**Améliorer et personnaliser le Service** : Comprendre vos préférences, améliorer les fonctionnalités, personnaliser votre expérience utilisateur.

**Communiquer avec vous** : Envoyer des notifications relatives à votre compte ou à vos événements (confirmations d'inscription, mises à jour, rappels), répondre à vos demandes de support, vous informer des nouvelles fonctionnalités ou offres.

**Analyser l'utilisation du Service** : Effectuer des recherches et des analyses pour comprendre comment le Service est utilisé et identifier des améliorations.

**Sécurité** : Détecter et prévenir la fraude, les abus et les activités illégales, protéger la sécurité de nos utilisateurs et de notre plateforme.

**Respect des obligations légales** : Nous conformer aux lois et réglementations applicables.
      `,
      truncatedText: `
Nous utilisons les informations collectées à diverses fins :

**Fournir et maintenir le Service** : Créer et gérer votre compte, traiter les paiements, héberger vos événements, gérer les inscriptions.
      `
    },
    {
      title: "Partage et divulgation de vos informations",
      icon: <FaShare className='mr-2 mb-1 inline text-indigo-600' size={32} />,
      image: Image3,
      fullText: `
Nous ne vendons ni ne louons vos informations personnelles à des tiers. Nous pouvons partager vos informations dans les situations suivantes :

**Avec les organisateurs d'événements** : Si vous êtes un participant, les informations nécessaires à votre inscription et à votre participation (nom, e-mail, réponses aux questions personnalisées de l'événement) seront partagées avec l'organisateur de l'événement concerné.

**Avec les participants à un événement** : Si vous êtes un organisateur, certaines informations sur les participants (selon les paramètres de confidentialité de l'événement) peuvent être visibles par les autres participants (par exemple, nom et photo de profil).

**Fournisseurs de services tiers** : Nous pouvons partager vos informations avec des entreprises tierces qui fournissent des services en notre nom, tels que le traitement des paiements, l'hébergement de données, l'analyse d'utilisation, l'envoi d'e-mails et le support client. Ces prestataires sont tenus de protéger vos informations et ne sont autorisés à les utiliser que pour les services spécifiques qu'ils nous fournissent.

**Obligations légales** : Nous pouvons divulguer vos informations si la loi l'exige ou si nous pensons de bonne foi qu'une telle action est nécessaire pour se conformer à une obligation légale, protéger nos droits ou notre propriété, prévenir des activités illégales ou protéger la sécurité personnelle des utilisateurs.

**Transferts d'entreprise** : En cas de fusion, acquisition, restructuration ou vente d'actifs, vos informations peuvent être transférées dans le cadre de cette transaction. Nous vous informerons avant que vos informations ne soient transférées et ne soient soumises à une politique de confidentialité différente.
      `,
      truncatedText: `
Nous ne vendons ni ne louons vos informations personnelles à des tiers. Nous pouvons partager vos informations dans les situations suivantes :

**Avec les organisateurs d'événements** : Si vous êtes un participant, les informations nécessaires à votre inscription et à votre participation (nom, e-mail, réponses aux questions personnalisées de l'événement) seront partagées avec l'organisateur de l'événement concerné.
      `
    },
    {
      title: "Sécurité des données",
      icon: <MdOutlineSecurity className='mr-2 mb-1 inline text-indigo-600' size={32} />,
      image: Image4,
      fullText: `
Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos informations personnelles contre l'accès non autorisé, la divulgation, l'altération ou la destruction. Cependant, aucune méthode de transmission sur Internet ou de stockage électronique n'est 100% sécurisée. Par conséquent, bien que nous nous efforcions de protéger vos informations personnelles, nous ne pouvons garantir leur sécurité absolue.
      `,
      truncatedText: `
Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos informations personnelles contre l'accès non autorisé,
      `
    },
    {
      title: "Vos droits",
      icon: <LuUserCheck className='mr-2 mb-1 inline text-indigo-600' size={32} />,
      image: Image5,
      fullText: `
Conformément à la législation applicable sur la protection des données, vous disposez de certains droits concernant vos informations personnelles :

**Droit d'accès** : Vous avez le droit de demander une copie des informations personnelles que nous détenons à votre sujet.

**Droit de rectification** : Vous avez le droit de demander la correction de toute information personnelle incomplète ou inexacte vous concernant.

**Droit à l'effacement (« droit à l'oubli »)** : Vous pouvez nous demander de supprimer vos informations personnelles dans certaines circonstances.

**Droit à la limitation du traitement** : Vous avez le droit de demander la limitation du traitement de vos informations personnelles.

**Droit à la portabilité des données** : Vous avez le droit de recevoir vos informations personnelles dans un format structuré, couramment utilisé et lisible par machine, et de les transférer à un autre responsable du traitement.

**Droit d'opposition** : Vous avez le droit de vous opposer au traitement de vos informations personnelles dans certaines situations.

Pour exercer ces droits, veuillez nous contacter à contact@mastertable.com ou via les coordonnées fournies ci-dessous. Nous répondrons à votre demande conformément aux lois applicables.
      `,
      truncatedText: `
Conformément à la législation applicable sur la protection des données, vous disposez de certains droits concernant vos informations personnelles :

**Droit d'accès** : Vous avez le droit de demander une copie des informations personnelles que nous détenons à votre sujet.
      `
    }
  ];

  const openModal = (key) => {
    setModalTitle(sections[key].title);
    setModalContent(sections[key].fullText);
    setModalIcon(sections[key].icon);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalIcon(null);
    setModalContent('');
    setModalTitle('');
  };

  const handleNext = () => {
    setIndex((prev) => (prev === sections.length - 1 ? 0 : prev + 1));
  };

  const handlePrevious = () => {
    setIndex((prev) => (prev === 0 ? sections.length - 1 : prev - 1));
  };

  return (
    <section className="relative py-16 px-4 sm:px-8 bg-transparent max-w-6xl mx-auto my-12">
      {/* Fond décoratif subtil */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-indigo-100/5 backdrop-blur-md rounded-3xl -z-10" />
      <h1 className="text-center text-5xl font-extrabold text-indigo-900 mb-6 tracking-tight drop-shadow-lg animate-fade-in">
        Politique de confidentialité
      </h1>
      <h2 className="text-center text-xl text-gray-600 font-medium max-w-3xl mx-auto mb-12 leading-relaxed animate-fade-in-up">
        Votre vie privée est notre priorité. Cette politique explique comment MasterTable collecte, utilise, partage et protège vos informations sur notre plateforme événementielle.
      </h2>
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 animate-fade-in-up">
        <button
          onClick={handlePrevious}
          className="group text-5xl text-indigo-400 hover:text-indigo-600 transition-all duration-300 p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-110"
          aria-label="Précédent"
        >
          <MdArrowLeft className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <div className="flex-1 px-8 py-10 bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 flex flex-col items-center max-w-3xl transition-transform duration-300 hover:scale-[1.01]">
          <h2 className="font-bold text-gray-900 text-3xl mb-8 flex items-center gap-3 animate-fade-in">
            {sections[index].icon}
            <span>{sections[index].title}</span>
          </h2>
          <div className="flex flex-col md:flex-row items-center gap-10">
            <img
              className="w-full max-w-[360px] rounded-2xl shadow-lg border border-indigo-100/50 transition-transform duration-300 hover:scale-105 animate-fade-in"
              src={sections[index].image}
              alt={sections[index].title}
            />
            <p className="w-full md:w-2/3 text-lg text-gray-700 whitespace-pre-line mt-6 md:mt-0 leading-relaxed animate-fade-in-up">
              {sections[index].truncatedText}
              ...
              <span
                className="mx-2 text-indigo-600 cursor-pointer hover:underline font-semibold transition-colors duration-200"
                onClick={() => openModal(index)}
              >
                Afficher plus
              </span>
            </p>
          </div>
          <Modal
            isOpen={isModalOpen}
            onClose={closeModal}
            icon={modalIcon}
            title={modalTitle}
          >
            <p className="whitespace-pre-line text-lg">{modalContent}</p>
          </Modal>
        </div>
        <button
          onClick={handleNext}
          className="group text-5xl text-indigo-400 hover:text-indigo-600 transition-all duration-300 p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-110"
          aria-label="Suivant"
        >
          <MdArrowRight className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </section>
  );
};

export default Confidentialite;