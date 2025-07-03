import React, { useState } from 'react';
import { FaDatabase,} from 'react-icons/fa';
import { MdOutlineSecurity, MdOutlinePolicy, MdPendingActions, MdViewModule   } from "react-icons/md";
import { RiMapPinTimeLine } from "react-icons/ri";
import { LuUserRoundCheck, LuLayoutDashboard  } from "react-icons/lu";
import { LiaCookieSolid } from "react-icons/lia";
import { TbShareOff } from "react-icons/tb";
import { IoIosArrowBack, IoIosArrowForward, IoMdArrowForward } from "react-icons/io";

const Confidentialite = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState('');
    const [modalTitle, setModalTitle] = useState('');
    const [modalIcon, setModalIcon] = useState(null);
    const [index, setIndex] = useState(0)

    // Contenu complet pour chaque sections[index]
    const sections = [
        {
            title: "Introduction",
            icon: <MdOutlinePolicy  className='mr-2 mb-1 inline' />,
            image: 'src/assets/marketers-with-magnifier-research-marketing-opportunities-chart-marketing-research-marketing-analysis-market-opportunities-and-problems-concept-flat-modern-illustration-vector.jpg',
            truncatedText: `
                La présente Politique de Confidentialité a pour objectif d’informer les utilisateurs de l’Application MasterTable sur la manière dont leurs données personnelles sont collectées, utilisées, stockées et protégées par RAPEX.
            `
        },
        {
            title: "Responsable du traitement",
            icon: <LuLayoutDashboard  className='mr-2 mb-1 inline' />,
            image: 'src/assets/stock-market-data-analysis-team-of-statistical-analysts-or-businesspeople-analyzing-statistical-information-trendy-illustration-vector.jpg',
            truncatedText: `
                Le traitement des données personnelles est effectué par <strong>RAPEX</strong>, qui est une entreprise :
                •	Au capital de 7 000 euros
                •	RCS Antananarivo 223 A 00061
                •	Siège social : Lot IIF 09 Fitroafana Talatamaty
                •	Email : contact@rapex.fr
                •	Téléphone : +261 34 08 402 97

            `
        },
        {
            title: "Données collectées",
            icon: <FaDatabase className='mr-2 mb-1 inline' />,
            image: 'src/assets/network-maintenance-graphic.jpg',
            truncatedText: `
                Les données pouvant être collectées incluent :
                    •	Informations d’identification (nom, prénom, adresse e-mail, etc.)
                    •	Informations liées à l’événement (date, lieu, nombre d’invités)
                    •	Données de connexion et de navigation (adresse IP, logs, cookies)

            `,
        },
        {
            title: "Finalités du traitement",
            icon: <MdPendingActions  className='mr-2 mb-1 inline' />,
            image: 'src/assets/Lovepik_com-450069426-a-mobile-privacy-protection-illustration-vector.png',
            truncatedText: `
                Les données collectées sont utilisées pour :
                    •	 Fournir les services de gestion d’événements et de placement des tables
                    •	 Gérer les comptes utilisateurs
                    •	 Améliorer l’expérience utilisateur
                    •	 Assurer la sécurité et la maintenance de l’Application
                    •	 Répondre aux obligations légales

            `,
        },
        {
            title: "Destinataires des données",
            icon: <TbShareOff className='mr-2 mb-1 inline' />,
            image: 'src/assets/istockphoto-1314379517-612x612.jpg',
            truncatedText: `
                Les données sont traitées exclusivement par les équipes de RAPEX. Elles ne sont ni vendues, ni louées à des tiers. Elles peuvent être partagées avec des prestataires techniques dans le strict cadre de l’hébergement ou de la maintenance de l’Application.
            `,
        },
        {
            title: "Durée de conservation",
            icon: <RiMapPinTimeLine className='mr-2 mb-1 inline' />,
            image: 'src/assets/vector-illustration-checklist-reviews-feedback-customer-opinions-quality-timeliness-women-men-workers-designed-website-web-landing-page-apps-ui-ux-poster-flyer_4968-1381.jpg',
            truncatedText: `
                Les données personnelles sont conservées pendant la durée nécessaire à la fourniture du service, augmentée de la durée légale applicable.
            `,
        },
        {
            title: "Droits des utilisateurs",
            icon: <LuUserRoundCheck className='mr-2 mb-1 inline' />,
            image: 'src/assets/rb_2149379500-3.png',
            truncatedText: `
                Conformément à la réglementation en vigueur, les utilisateurs disposent des droits suivants :
                •	Droit d’accès, de rectification, d’effacement
                •	Droit d’opposition et de limitation du traitement
                •	Droit à la portabilité des données
                •	Droit d’introduire une réclamation auprès de la CNID (Commission Nationale Indépendante des Données Personnelles)
                Les demandes peuvent être adressées à : contact@rapex.fr

            `,
        },
        {
            title: "Sécurité",
            icon: <MdOutlineSecurity className='mr-2 mb-1 inline' />,
            image: 'src/assets/pngtree-data-secure-people-protect-cybersecurity-picture-image_8729665.png',
            truncatedText: `
                RAPEX met en place toutes les mesures techniques et organisationnelles appropriées pour protéger les données personnelles contre toute destruction, perte, altération ou accès non autorisé.
            `,
        },
        {
            title: "Cookies",
            icon: <LiaCookieSolid className='mr-2 mb-1 inline' />,
            image: 'src/assets/cookies-function.webp',
            truncatedText: `
                L’Application peut utiliser des cookies pour améliorer l’expérience utilisateur. L’utilisateur peut refuser l’installation des cookies via les paramètres de son navigateur.
            `,
        },
        {
            title: "Modification de la politique",
            icon: <MdViewModule  className='mr-2 mb-1 inline' />,
            image: 'src/assets/Illustration.png',
            truncatedText: `
                RAPEX se réserve le droit de modifier la présente Politique à tout moment. En cas de modification substantielle, les utilisateurs seront informés via l’Application.
            `,
        },
    ]

    const handleNext = () => {
        setIndex(index === sections.length - 1 ? 0 : index + 1); 
    }

    const handlePrev = () => {
        setIndex(index === 0 ? sections.length - 1 : index - 1);       
    }

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">Politique de confidentialités</h2>
            <h3 className='text-center p-3 text-gray-500 font-normal text-xl w-[60%] mx-auto'>
                Votre vie privée est très importante pour nous. Cette Politique de Confidentialité explique comment MasterTable collecte, utilise, divulgue et protège vos informations lorsque vous utilisez notre site de gestion d'événements.
            </h3>
            <div className='flex justify-around items-center my-6 gap-2'>
                <span onClick={handlePrev} className='cursor-pointer text-5xl text-gray-500 hover:text-gray-700 transition-all duration-300'>
                    <IoIosArrowBack/>
                </span>
                <div className='px-11 py-10 bg-white'>
                    <h2 className='font-semibold text-gray-800 px-4 text-2xl pb-10'>
                        {sections[index].icon} <span className='inline'>{sections[index].title}</span>
                    </h2>
                    <div className={`flex justify-center items-center ${index % 2 === 0 ? 'flex-row-reverse' : 'flex-row'} flex-wrap-reverse h-[50vh] p-4 gap-20`}>
                        <img className='w-full max-w-[400px]' src={sections[index].image} alt="" />
                        < p className='w-full md:w-2/5 text-lg text-[#4E4E4E] whitespace-pre-line mt-3' dangerouslySetInnerHTML={{ __html: sections[index].truncatedText}}/>
                    </div>
                </div>
                <span onClick={handleNext} className='cursor-pointer text-5xl text-gray-500 hover:text-gray-700 transition-all duration-300'>
                    <IoIosArrowForward/>
                </span>
            </div>
        </div>
    );
};

export default Confidentialite;