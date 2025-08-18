import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NosService from "../util/nosService";
import Testimonials from "../util/testimony";
import Contact from "../util/contact";
import ButtonConnexion from "../util/buttonconnexion";
import {  getCountEvents } from "../services/evenementServ";
import { FormaNumber } from "../services/controll_champs/controll_limite";
import { getUserCount } from "../services/userService";
import { getAllEvents } from '../services/evenementServ';


import { AuthModal } from "../components/Modal/authModal";
import SuccessEvent from "../util/SuccessEvent";
import Aboutus from "../util/Aboutus";

const images = [
  "/images/music-7238254_1280.jpg",
  "/images/birthday.jpeg",
  "/images/little-girl-6746693_1280.jpg",
  "/images/play-5134828_1280.jpg",
  "/images/couple-443600_1280.jpg",
];

const Publicacc = () => {
    const [allEvents, setAllEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [current, setCurrent] = useState(0);
    const [isModalOpen, setModalOpen] = useState(false); // État pour le authModal
    const intervalRef = useRef(null);
    const touchStartX = useRef(0);
    const accueilRef = useRef(null);
    const serviceRef = useRef(null);
    const contactRef = useRef(null);
    const testimonyRef = useRef(null);
    const [eventCount,setEventCount] = useState(0);

    useEffect(() => {
        const fetchAllEvents = async () => {
        try {
            setLoading(true);
            setError(null);
    
            const events = await getAllEvents();
    
            if (!Array.isArray(events)) {
            throw new Error('La réponse du serveur n\'est pas un tableau');
            }
    
            // Trier par date décroissante et limiter à 4 événements les plus récents
            const sortedEvents = events
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 4);
            setAllEvents(sortedEvents);
    
        } catch (err) {
            console.error('❌ Erreur détaillée:', err);
    
            // Gestion d'erreur plus précise
            let errorMessage = 'Erreur lors du chargement des événements';
    
            if (err.response) {
            // Le serveur a répondu avec un code d'erreur
            errorMessage = `Erreur serveur: ${err.response.status} - ${err.response.data?.message || err.response.statusText}`;
            } else if (err.request) {
            // La requête a été faite mais pas de réponse
            errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
            } else if (err.message) {
            // Erreur dans la configuration de la requête
            errorMessage = `Erreur de configuration: ${err.message}`;
            }
    
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
        };
    
        fetchAllEvents();
    }, []);
  
    const [organisateurCount,setOrganisateurCount] = useState(0);
    useEffect(() => {
        const hash = window.location.hash;
        if (hash === "#service" && serviceRef.current) {
        serviceRef.current.scrollIntoView({ behavior: "smooth" });
        }
        if (hash === "#contact" && contactRef.current) {
        contactRef.current.scrollIntoView({ behavior: "smooth" });
        }
        if (hash === "#testimony" && testimonyRef.current) {
        testimonyRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, []);

    useEffect(() => {
        startAutoPlay();
        return () => stopAutoPlay();
    }, []);

    const startAutoPlay = () => {
        stopAutoPlay();
        intervalRef.current = setInterval(() => {
        next();
        }, 2000);
    };

    const stopAutoPlay = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
    };

    const prev = () =>
        setCurrent((prev) => (prev - 1 + images.length) % images.length);

    const next = () =>
        setCurrent((prev) => (prev + 1) % images.length);

    const goTo = (index) => setCurrent(index);

    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const delta = touchEndX - touchStartX.current;
        if (delta > 50) prev();
        else if (delta < -50) next();
    };

    useEffect(()=>{
        const fetchData = async () => {
        try{
            const count = await getCountEvents();
        setEventCount(count);
        }catch(err){
            console.log(err)
        } 
        };
        fetchData();
    },[]);

    useEffect(()=>{
        const fetchDataUserCount= async () =>{
        try{

        const count =await getUserCount();
        setOrganisateurCount(count);
        }catch(err){
        console.log(err)
        }
        };
        fetchDataUserCount();
    },[]);

    const renderStars= (currentRating, interactive = false) => {
    return [...Array(5)].map((_, index) => (
        <FaStar
        key={index}
        onClick={interactive ? () => setRating(index + 1) : undefined}
        onMouseEnter={interactive ? () => setHoverRating(index + 1) : undefined}
        onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
        className={`${interactive ? "cursor-pointer" : ""} transition-all duration-300 transform ${
            index < (interactive ? hoverRating || rating : currentRating)
            ? "text-yellow-400 scale-110 drop-shadow-lg"
            : "text-gray-300"
        } ${interactive && index < (hoverRating || rating) ? "hover:scale-125" : ""}`}
        size={interactive ? 32 : 20}
        />
    ));
    };

    const getEventIcon = (type) => {
        const icons = {
        'mariage': '💒',
        'anniversaire': '🎂',
        'conference': '🎤',
        'seminaire': '📚',
        'concert': '🎵',
        'exposition': '🖼️',
        'formation': '🎓',
        'reunion': '👥',
        'default': '🎉'
        };
        
        return icons[type?.toLowerCase()] || icons.default;
    };

    // Fonction pour formater la date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
        });
    };

    // Fonction pour formater l'heure
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
        });
    };

    const getEventTypeColor = (type) => {
        const colors = {
        'conférence': 'from-blue-500 to-indigo-600',
        'workshop': 'from-purple-500 to-violet-600',
        'formation': 'from-green-500 to-emerald-600',
        'séminaire': 'from-orange-500 to-red-600',
        'meetup': 'from-pink-500 to-rose-600',
        'webinaire': 'from-cyan-500 to-blue-600',
        default: 'from-gray-500 to-slate-600'
        };
        return colors[type?.toLowerCase()] || colors.default;
    };
    return (
        <>

        <AuthModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
        <section id="pagepublic" ref={accueilRef}>
            <div
            className="relative w-full h-screen overflow-hidden"
            onMouseEnter={stopAutoPlay}
            onMouseLeave={startAutoPlay}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            >
            {/* Background avec overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60 z-10" />

            <div className="relative h-full rounded-lg">
                <AnimatePresence>
                <motion.img
                    key={images[current]}
                    src={images[current]}
                    alt={`Slide ${current + 1}`}
                    className="absolute inset-0 w-full h-full object-cover"
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                />
                </AnimatePresence>
            </div>

            {/* Contenu principal */}
            <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="text-center space-y-8 max-w-4xl px-6">
                {/* Badge animé */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-xl"
                >
                    <span className="text-white text-sm font-semibold tracking-wide">
                    Événements d'exception
                    </span>
                </motion.div>

                {/* Titre principal */}
                <motion.h1
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight"
                >
                    <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
                    Vivez
                    </span>{" "}
                    des moments
                    <br />
                    <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    inoubliables
                    </span>
                </motion.h1>

                {/* Sous-titre */}
                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                    className="text-white/90 text-xl sm:text-2xl font-light leading-relaxed max-w-2xl mx-auto"
                >
                    Créez, organisez et participez à des événements qui marquent les esprits.
                    <span className="font-semibold text-orange-300"> Votre expérience commence ici.</span>
                </motion.p>

                {/* Boutons d'action */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.9 }}
                    className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8"
                >

                    <button
                    onClick={() => setModalOpen(true)} // Ouvrir le modal à la cliqué
                    className="group relative bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white px-10 py-4 rounded-full font-semibold text-lg shadow-2xl hover:shadow-orange-500/25 transform hover:-translate-y-2 transition-all duration-300 overflow-hidden min-w-[200px] cursor-pointer"
                    >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                        Inscription
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </button>

                    <div className="transform hover:-translate-y-2 transition-all duration-300 cursor-pointer">
                    <ButtonConnexion />
                    </div>
                </motion.div>

                {/* Statistiques */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.1 }}
                    className="flex flex-col sm:flex-row gap-8 justify-center items-center pt-12"
                >
                    <div className="text-center group">
                    <div className="text-3xl font-bold text-white group-hover:text-orange-400 transition-colors duration-300"><strong>{FormaNumber(eventCount)}</strong></div>
                    <div className="text-white/70 text-sm font-medium">Événements créés</div>
                    </div>
                    <div className="text-center group">
                    <div className="text-3xl font-bold text-white group-hover:text-blue-400 transition-colors duration-300"><strong>{FormaNumber(organisateurCount)}</strong></div>
                    <div className="text-white/70 text-sm font-medium">Participants actifs</div>
                    </div>
                    <div className="text-center group">
                    <div className="text-3xl font-bold text-white group-hover:text-green-400 transition-colors duration-300">4.9★</div>
                    <div className="text-white/70 text-sm font-medium">Satisfaction client</div>
                    </div>
                </motion.div>
                </div>
            </div>

            {/* Indicateurs élégants */}
            {/* <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
                <div className="flex space-x-4 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
                {images.map((_, i) => (
                    <button
                    key={i}
                    onClick={() => goTo(i)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        i === current 
                        ? "bg-white scale-125 shadow-lg" 
                        : "bg-white/50 hover:bg-white/70"
                    }`}
                    aria-label={`Slide ${i + 1}`}
                    />
                ))}
                </div>
            </div> */}

            {/* Contrôles stylisés */}
            <button
                onClick={prev}
                className="absolute left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-2xl hover:bg-white/20 hover:scale-110 transition-all duration-300 flex items-center justify-center"
                aria-label="Previous"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <button
                onClick={next}
                className="absolute right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-2xl hover:bg-white/20 hover:scale-110 transition-all duration-300 flex items-center justify-center"
                aria-label="Next"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>

            {/* Effet de scroll vers le bas */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1.3, repeat: Infinity, repeatType: "reverse" }}
                className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-20"
            >
                <div className="flex flex-col items-center text-white/60">
                <span className="text-xs font-medium mb-2 tracking-wide">Découvrez plus</span>
                <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                </div>
            </motion.div>
            </div>
        </section>

        <section id="service" ref={serviceRef}>
            <div className="bg-gradient-to-b from-gray-50 to-white">
                <NosService />
            </div>
        </section>

        {/* Section Événements de Succès - Design Pro avec gestion d'images */}
        <section id="success">
            <div className="bg-gradient-to-b from-gray-50 to-white">
                <SuccessEvent />
            </div>
        </section>

        <section id="testimony" ref={testimonyRef} >
            <div className="bg-gradient-to-b from-gray-50 to-white">
                <Testimonials />
            </div>
        </section>

        {/* Section À Propos */}
        <section id="about">
            <div className="bg-gradient-to-b from-gray-50 to-white">
                <Aboutus />
            </div>
        </section>

        <section id="contact" ref={contactRef}>
            <div className="bg-gradient-to-b from-gray-50 to-white">
            <Contact />
            </div>
        </section>
        <footer className="bg-gray-700 p-5">
            <div className="">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                {/* Logo/Nom */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#FB9E3A] to-orange-400 rounded-xl flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    </div>
                    <span className="text-xl font-black text-white">Rapex group</span>
                </div>
                <p className="text-slate-400 text-sm">
                    © 2025. Tous droits réservés
                </p>
                </div>

                <div className="flex items-center gap-6 text-sm">
                <a
                    href="#"
                    className="text-slate-400 hover:text-white transition-colors hover:underline"
                >
                    Politique de confidentialité
                </a>
                <a
                    href="#"
                    className="text-slate-400 hover:text-white transition-colors hover:underline"
                >
                    Conditions d'utilisation
                </a>
                <a
                    href="#"
                    className="text-slate-400 hover:text-white transition-colors hover:underline"
                >
                    Support
                </a>
                </div>
            </div>
            </div>
        </footer>
        </>
    );
};

export default Publicacc;
