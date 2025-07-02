import React, { useState } from 'react';
import { FaDatabase, FaTable, FaShare, FaArrowCircleLeft, FaArrowCircleRight, FaArrowLeft } from 'react-icons/fa';
import { MdOutlineSecurity, MdArrowLeft, MdArrowRight } from "react-icons/md";
import { LuUserRoundCheck } from "react-icons/lu";
import Modal from './Modal'; // Assurez-vous que le chemin est correct

const Confidentialite = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState('');
    const [modalTitle, setModalTitle] = useState('');
    const [modalIcon, setModalIcon] = useState(null);
    const [index, setIndex] = useState(0)

    // Contenu complet pour chaque section
    const sections = [
        {
            title: "Informations que nous collectons",
            icon: <FaDatabase className='mr-2 mb-1 inline' />,
            image: 'src/assets/marketers-with-magnifier-research-marketing-opportunities-chart-marketing-research-marketing-analysis-market-opportunities-and-problems-concept-flat-modern-illustration-vector.jpg',
            fullText: `
                Nous pouvons collecter différents types d'informations vous concernant, y compris :

                Informations personnelles identifiables (IPI) : Lors de l'inscription/création de compte : Nom, prénom, adresse e-mail, numéro de téléphone, mot de passe.

                Lors de la création ou de la participation à un événement : Informations de paiement (via des processeurs tiers sécurisés), adresse de facturation, informations spécifiques à l'événement (par exemple, préférences alimentaires, informations sur les invités).

                Informations de profil : Photo de profil (si fournie), organisation, titre. Données d'utilisation : Informations sur la manière dont vous accédez et utilisez le Service (par exemple, adresses IP, types de navigateur, pages visitées, temps passé sur les pages, chemins de navigation).

                Données relatives aux événements que vous créez, gérez ou auxquels vous participez (nombre d'inscriptions, interactions avec les fonctionnalités).

                Données de communication : Contenu des messages que vous envoyez via notre plateforme (par exemple, messages aux organisateurs ou aux participants).

                Historique de vos interactions avec notre support client.

                Cookies et technologies similaires : Nous utilisons des cookies et des balises web pour suivre l'activité sur notre Service et conserver certaines informations. Les cookies sont de petits fichiers de données placés sur votre appareil.
            `,
            truncatedText: `
                Nous pouvons collecter différents types d'informations vous concernant, y compris :

                Informations personnelles identifiables (IPI) : Lors de l'inscription/création de compte : Nom, prénom, adresse e-mail, numéro de téléphone, mot de passe.
            `
        },
        {
            title: "Comment nous utilisons vos informations",
            icon: <FaTable className='mr-2 mb-1 inline' />,
            image: 'src/assets/stock-market-data-analysis-team-of-statistical-analysts-or-businesspeople-analyzing-statistical-information-trendy-illustration-vector.jpg',
            fullText: `
                Nous utilisons les informations collectées à diverses fins :

                Fournir et maintenir le Service : Créer et gérer votre compte, traiter les paiements, héberger vos événements, gérer les inscriptions. 

                Améliorer et personnaliser le Service : Comprendre vos préférences, améliorer les fonctionnalités, personnaliser votre expérience utilisateur. 

                Communiquer avec vous : Envoyer des notifications relatives à votre compte ou à vos événements (confirmations d'inscription, mises à jour, rappels), répondre à vos demandes de support, vous informer des nouvelles fonctionnalités ou offres. 

                Analyser l'utilisation du Service : Effectuer des recherches et des analyses pour comprendre comment le Service est utilisé et identifier des améliorations. 

                Sécurité : Détecter et prévenir la fraude, les abus et les activités illégales, protéger la sécurité de nos utilisateurs et de notre plateforme. 

                Respect des obligations légales : Nous conformer aux lois et réglementations applicables.
            `,
            truncatedText: `
                Nous utilisons les informations collectées à diverses fins :

                Fournir et maintenir le Service : Créer et gérer votre compte, traiter les paiements, héberger vos événements, gérer les inscriptions. 
            `
        },
        {
            title: "Partage et divulgation de vos informations",
            icon: <FaShare className='mr-2 mb-1 inline' />,
            image: 'src/assets/network-maintenance-graphic.jpg',
            fullText: `
                Nous ne vendons ni ne louons vos informations personnelles à des tiers. Nous pouvons partager vos informations dans les situations suivantes :

                Avec les organisateurs d'événements : Si vous êtes un participant, les informations nécessaires à votre inscription et à votre participation (nom, e-mail, réponses aux questions personnalisées de l'événement) seront partagées avec l'organisateur de l'événement concerné. 

                Avec les participants à un événement : Si vous êtes un organisateur, certaines informations sur les participants (selon les paramètres de confidentialité de l'événement) peuvent être visibles par les autres participants (par exemple, nom et photo de profil). 

                Fournisseurs de services tiers : Nous pouvons partager vos informations avec des entreprises tierces qui fournissent des services en notre nom, tels que le traitement des paiements, l'hébergement de données, l'analyse d'utilisation, l'envoi d'e-mails et le support client. Ces prestataires sont tenus de protéger vos informations et ne sont autorisés à les utiliser que pour les services spécifiques qu'ils nous fournissent. 

                Obligations légales : Nous pouvons divulguer vos informations si la loi l'exige ou si nous pensons de bonne foi qu'une telle action est nécessaire pour se conformer à une obligation légale, protéger nos droits ou notre propriété, prévenir des activités illégales ou protéger la sécurité personnelle des utilisateurs. 

                Transferts d'entreprise : En cas de fusion, acquisition, restructuration ou vente d'actifs, vos informations peuvent être transférées dans le cadre de cette transaction. Nous vous informerons avant que vos informations ne soient transférées et ne soient soumises à une politique de confidentialité différente.
            `,
            truncatedText: `
                Nous ne vendons ni ne louons vos informations personnelles à des tiers. Nous pouvons partager vos informations dans les situations suivantes :

                Avec les organisateurs d'événements : Si vous êtes un participant, les informations nécessaires à votre inscription et à votre participation (nom, e-mail, réponses aux questions personnalisées de l'événement) seront partagées avec l'organisateur de l'événement concerné. 
            `,
        },
        {
            title: "Sécurité des données",
            icon: <MdOutlineSecurity className='mr-2 mb-1 inline' />,
            image: 'src/assets/pngtree-data-secure-people-protect-cybersecurity-picture-image_8729665.png',
            fullText: `
                Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos informations personnelles contre l'accès non autorisé, la divulgation, l'altération ou la destruction. Cependant, aucune méthode de transmission sur Internet ou de stockage électronique n'est 100% sécurisée. Par conséquent, bien que nous nous efforcions de protéger vos informations personnelles, nous ne pouvons garantir leur sécurité absolue.
            `,
            truncatedText: `
                Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos informations personnelles contre l'accès non autorisé,
            `,
        },
        {
            title: "Vos droits",
            icon: <LuUserRoundCheck className='mr-2 mb-1 inline' />,
            image: 'src/assets/istockphoto-1314379517-612x612.jpg',
            fullText: `
                Conformément à la législation applicable sur la protection des données, vous disposez de certains droits concernant vos informations personnelles :

                Droit d'accès : Vous avez le droit de demander une copie des informations personnelles que nous détenons à votre sujet.

                Droit de rectification : Vous avez le droit de demander la correction de toute information personnelle incomplète ou inexacte vous concernant. 

                Droit à l'effacement (« droit à l'oubli ») : Vous pouvez nous demander de supprimer vos informations personnelles dans certaines circonstances. 

                Droit à la limitation du traitement : Vous avez le droit de demander la limitation du traitement de vos informations personnelles. 

                Droit à la portabilité des données : Vous avez le droit de recevoir vos informations personnelles dans un format structuré, couramment utilisé et lisible par machine, et de les transférer à un autre responsable du traitement. 

                Droit d'opposition : Vous avez le droit de vous opposer au traitement de vos informations personnelles dans certaines situations. 

                Pour exercer ces droits, veuillez nous contacter à [votre adresse e-mail de contact] ou via les coordonnées fournies ci-dessous. Nous répondrons à votre demande conformément aux lois applicables.
            `,
            truncatedText: `
                Conformément à la législation applicable sur la protection des données, vous disposez de certains droits concernant vos informations personnelles :

                Droit d'accès : Vous avez le droit de demander une copie des informations personnelles que nous détenons à votre sujet.
            `,
        },
    ]

    const openModal = (Key) => {
        setModalTitle(sections[Key].title);
        setModalContent(sections[Key].fullText);
        setModalIcon(sections[Key].icon);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalIcon(null);
        setModalContent('');
        setModalTitle('');
    };

    const handleNext = () => {
        index === sections.length - 1 ? setIndex(0) : setIndex(index + 1)
    }

    const handlePrevious = () => {
        index === 0 ? setIndex(sections.length - 1) : setIndex(index - 1)
    }

    return (
        <div>
            <h1 className='text-center p-6 text-gray-500 font-medium text-3xl'>Politique de confidentialité</h1>
            <h2 className='text-center p-3 text-gray-500 font-normal text-xl w-[60%] mx-auto'>
                Votre vie privée est très importante pour nous. Cette Politique de Confidentialité explique comment MasterTable collecte, utilise, divulgue et protège vos informations lorsque vous utilisez notre site de gestion d'événements.
            </h2>
            <div className='flex justify-around items-center h-[80vh] gap-2 overflow-hidden'>
                <span onClick={handlePrevious} className='text-8xl mx-2 text-gray-500 hover:text-gray-800 transition duration-100 cursor-pointer'>
                    <MdArrowLeft />
                </span>
                <div className='px-11 py-10 bg-white rounded-lg shadow-lg'>
                    <h2 className='font-semibold text-gray-800 px-4 text-2xl pb-10'>
                        {sections[index].icon} <span className='inline'>{sections[index].title}</span>
                    </h2>
                    <div className={`flex justify-center items-center ${index % 2 === 0 ? 'flex-row-reverse' : 'flex-row'} flex-wrap-reverse h-[50vh] p-4 gap-20`}>
                        <img className='w-full max-w-[400px]' src={sections[index].image} alt="" />
                        <p className='w-full md:w-2/5 text-lg text-[#4E4E4E] whitespace-pre-line'> {/* Utilisez md:w-2/5 pour des écrans plus grands */}
                            {sections[index].truncatedText}
                            ...
                            <span
                                className='mx-1 text-blue-700 cursor-pointer hover:underline'
                                onClick={() => openModal(index)}
                            >
                                Afficher plus
                            </span>
                        </p>
                    </div>

                    {/* Le Modal est rendu ici, il n'est visible que si isModalOpen est true */}
                    <Modal
                        isOpen={isModalOpen}
                        onClose={closeModal}
                        icon={modalIcon}
                        title={modalTitle}
                    >
                        <p className="whitespace-pre-line">{modalContent}</p> {/* whitespace-pre-line pour conserver les sauts de ligne */}
                    </Modal>
                </div>
                <span onClick={handleNext} className='text-8xl mx-2 text-gray-500 hover:text-gray-800 transition duration-100 cursor-pointer'>
                    <MdArrowRight />
                </span>
            </div>
        </div>
    );
};

export default Confidentialite;