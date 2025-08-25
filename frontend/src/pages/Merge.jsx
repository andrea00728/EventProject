import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NosService from "../util/nosService";
import Testimonials from "../util/testimony";
import Contact from "../util/contact";
import { getCountEvents } from "../services/evenementServ";
import { getUserCount } from "../services/userService";
import { getAllEvents } from "../services/evenementServ";
import { AuthModal } from "../components/Modal/authModal";
import SuccessEvent from "../util/SuccessEvent";
import Aboutus from "../util/Aboutus";
import NosForfaits from "../util/nosForfaits";
import Footer from "./footer";
import Demo from "../util/Dem";
import DemoTable from "../util/demo";
import { useStateContext } from "../context/ContextProvider";
import TestimonialsSection from "../util/testimonialsSection";
import Confidentialite from "../util/Confidentialite";

const images = [
  "/images/music-7238254_1280.jpg",
  "/images/birthday.jpeg",
  "/images/little-girl-6746693_1280.jpg",
  "/images/play-5134828_1280.jpg",
  "/images/couple-443600_1280.jpg",
];

// Composant Modal pour Confidentialite
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-5xl w-full mx-4 max-h-[80vh] overflow-y-auto shadow-xl">
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl font-bold"
          >
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

const Publicacc = () => {
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [current, setCurrent] = useState(0);
  const [isModalOpen, setModalOpen] = useState(false);
  const { isAuthenticated } = useStateContext()

  // ✅ Nouvel état pour le modal Demo
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isConfidentialiteOpen, setIsConfidentialiteOpen] = useState(false); // Nouvel état pour la modale Confidentialite
  const [organisateurCount, setOrganisateurCount] = useState(0);
  const [eventCount, setEventCount] = useState(0);
  const intervalRef = useRef(null);
  const touchStartX = useRef(0);
  const accueilRef = useRef(null);
  const serviceRef = useRef(null);
  const forfaitRef = useRef(null);
  const contactRef = useRef(null);
  const testimonyRef = useRef(null);
  const footerRef = useRef(null);

  const isAuthent = Boolean(isAuthenticated);

  // Charger les événements
  useEffect(() => {
    const fetchAllEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const events = await getAllEvents();
        if (!Array.isArray(events)) throw new Error("La réponse n'est pas un tableau");
        const sortedEvents = events
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 4);
        setAllEvents(sortedEvents);
      } catch (err) {
        console.error("❌ Erreur:", err);
        setError("Erreur lors du chargement des événements");
      } finally {
        setLoading(false);
      }
    };
    fetchAllEvents();
  }, []);

  // Scroll auto du carousel
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

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const delta = touchEndX - touchStartX.current;
    if (delta > 50) prev();
    else if (delta < -50) next();
  };

  // Charger le nombre d'événements
  useEffect(() => {
    const fetchData = async () => {
      try {
        const count = await getCountEvents();
        setEventCount(count);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, []);

  // Charger le nombre d’utilisateurs
  useEffect(() => {
    const fetchDataUserCount = async () => {
      try {
        const count = await getUserCount();
        setOrganisateurCount(count);
      } catch (err) {
        console.log(err);
      }
    };
    fetchDataUserCount();
  }, []);

  return (
    <>
      <AuthModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
      <Modal isOpen={isConfidentialiteOpen} onClose={() => setIsConfidentialiteOpen(false)}>
        <Confidentialite />
      </Modal>

      <section id="pagepublic" ref={accueilRef}>
        <div
          className="relative w-full h-screen overflow-hidden"
          onMouseEnter={() => clearInterval()} // stop autoplay (simplifié)
        >
          {/* Background avec overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60 z-10" />

          {/* Carousel */}
          <div className="relative h-full">
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
            <div className="text-center space-y-6 sm:space-y-8 max-w-4xl px-4 sm:px-6 lg:px-8">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-xl"
              >
                <span className="text-white text-xs sm:text-sm font-semibold tracking-wide">
                  Événements d'exception
                </span>
              </motion.div>

              {/* Titre */}
              <motion.h1
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight tracking-tight"
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
                className="text-white/90 text-base sm:text-lg md:text-xl lg:text-2xl font-light leading-relaxed max-w-2xl mx-auto"
              >
                Créez, organisez et participez à des événements qui marquent les esprits.
                <span className="font-semibold text-orange-300"> Votre expérience commence ici.</span>
              </motion.p>

              {/* Boutons dynamiques */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9 }}
                className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center pt-6 sm:pt-8"
              >
                {!isAuthent ? (
                  <button
                    onClick={() => setModalOpen(true)}
                    className="group relative bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white px-6 sm:px-8 lg:px-10 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg shadow-2xl hover:shadow-orange-500/25 transform hover:-translate-y-2 transition-all duration-300 overflow-hidden min-w-[160px] sm:min-w-[200px] cursor-pointer"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      Inscription
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </button>
                ) : (
                  <a
                    href="#demo"
                    className="group relative bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white px-6 sm:px-8 lg:px-10 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg shadow-2xl hover:shadow-blue-500/25 transform hover:-translate-y-2 transition-all duration-300 overflow-hidden min-w-[160px] sm:min-w-[200px] cursor-pointer"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      Voir la vidéo
                    </span>
                  </a>
                )}

                {/* ✅ Bouton Voir Démo (ouvre le modal Demo) */}
                <button
                  onClick={() => setIsOpen(true)}
                  className="group relative bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white px-6 sm:px-8 lg:px-10 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg shadow-2xl hover:shadow-green-500/25 transform hover:-translate-y-2 transition-all duration-300 overflow-hidden min-w-[160px] sm:min-w-[200px] cursor-pointer"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    Voir démo
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Modal plein écran */}
        {isOpen && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
            <div className="relative w-full h-full bg-white flex flex-col items-center justify-center">
              {/* Bouton fermer */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-6 text-2xl font-bold text-gray-800 hover:text-red-500 transition-colors"
              >
                ✕
              </button>

              {/* Contenu du modal */}
              <DemoTable />
            </div>
          </div>
        )}
      </section>

      {/* Autres sections */}
      <section id="service" ref={serviceRef}>
        <div className="bg-gradient-to-b from-gray-50 to-white">
          <NosService />
        </div>
      </section>

      <section id="demo">
        <div className="bg-gradient-to-b from-gray-50 to-white">
          <Demo isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
        </div>
      </section>

      <section id="success">
        <div className="bg-gradient-to-b from-gray-50 to-white">
          <SuccessEvent />
        </div>
      </section>

      <section id="testimony" ref={testimonyRef}>
        <div className="bg-gradient-to-b from-gray-50 to-white">
          {!isAuthent ? (
            <Testimonials />
          ) : (
            <>
              <Testimonials />
              <TestimonialsSection />
            </>
          )
          }
        </div>
      </section>

      <section id="forfaits" ref={forfaitRef}>
        <div className="bg-gradient-to-b from-gray-50 to-white">
          <NosForfaits />
        </div>
      </section>

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

      <section id="footer" ref={footerRef}>
        <div className="bg-gradient-to-b from-gray-50 to-white">
          <Footer onShowConfidentialite={() => setIsConfidentialiteOpen(true)} />
        </div>
      </section>
    </>
  );
};

export default Publicacc;