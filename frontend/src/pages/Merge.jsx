import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NosService from "../util/nosService";
import Testimonials from "../util/testimony";
import Contact from "../util/contact";
import ButtonConnexion from "../util/buttonconnexion";
import { getCountEvents } from "../services/evenementServ";
import { FormaNumber } from "../services/controll_champs/controll_limite";
import { getUserCount } from "../services/userService";
import { AuthModal } from "../components/Modal/authModal";
import NosForfaits from '../util/nosForfaits';
// import Card from '../components/Card';


const images = [
  "/images/music-7238254_1280.jpg",
  "/images/birthday.jpeg",
  "/images/little-girl-6746693_1280.jpg",
  "/images/play-5134828_1280.jpg",
  "/images/couple-443600_1280.jpg",
];

const Publicacc = () => {
  const [current, setCurrent] = useState(0);
  const [isModalOpen, setModalOpen] = useState(false);
  const intervalRef = useRef(null);
  const touchStartX = useRef(0);
  const accueilRef = useRef(null);
  const serviceRef = useRef(null);
  const contactRef = useRef(null);
  const testimonyRef = useRef(null);
  const plansRef = useRef(null);
  const [eventCount,setEventCount] = useState(0);
  const [organisateurCount,setOrganisateurCount] = useState(0);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash === "#service" && serviceRef.current) serviceRef.current.scrollIntoView({ behavior: "smooth" });
    if (hash === "#contact" && contactRef.current) contactRef.current.scrollIntoView({ behavior: "smooth" });
    if (hash === "#testimony" && testimonyRef.current) testimonyRef.current.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, []);

  const startAutoPlay = () => {
    stopAutoPlay();
    intervalRef.current = setInterval(() => next(), 2000);
  };

  const stopAutoPlay = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const Card = ({ title, price, invitations, events, duration, active, expire }) => {
    return (
      <div className={`rounded-xl shadow-lg p-6 border ${
          active ? "bg-yellow-400 border-yellow-500 relative" : "bg-white border-gray-200"
        }`}>
        {active && (
          <div className="absolute top-3 right-3 bg-white text-yellow-600 px-3 py-1 rounded-full text-xs font-bold">
            Actif
          </div>
        )}
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        <p className="text-2xl font-extrabold mb-2">{price}</p>
        <p>Invitations : {invitations}</p>
        <p>Événements : {events}</p>
        <p>Durée : {duration}</p>
        {active && expire && <p className="mt-2 text-sm">Expire le : {expire}</p>}
      </div>
    );
  };

  const prev = () => setCurrent((prev) => (prev - 1 + images.length) % images.length);
  const next = () => setCurrent((prev) => (prev + 1) % images.length);
  const goTo = (index) => setCurrent(index);
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta > 50) prev();
    else if (delta < -50) next();
  };

  useEffect(()=>{
    const fetchData = async () => {
      try{
        const count = await getCountEvents();
        setEventCount(count);
      }catch(err){ console.log(err) } 
    };
    fetchData();
  },[]);

  useEffect(()=>{
    const fetchDataUserCount= async () =>{
      try{
        const count =await getUserCount();
        setOrganisateurCount(count);
      }catch(err){ console.log(err) }
    };
    fetchDataUserCount();
  },[]);

  return (
    <>
      <AuthModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />

      {/* Slider Principal */}
      <section id="pagepublic" ref={accueilRef}>
        <div
          className="relative w-full h-screen overflow-hidden"
          onMouseEnter={stopAutoPlay}
          onMouseLeave={startAutoPlay}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
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

          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="text-center space-y-8 max-w-4xl px-6">
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

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="text-white/90 text-xl sm:text-2xl font-light leading-relaxed max-w-2xl mx-auto"
              >
                Créez, organisez et participez à des événements qui marquent les esprits.
                <span className="font-semibold text-orange-300"> Votre expérience commence ici.</span>
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9 }}
                className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8"
              >
                <button
                  onClick={() => setModalOpen(true)}
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

          {/* Contrôles du slider */}
          <button onClick={prev} className="absolute left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-2xl hover:bg-white/20 hover:scale-110 transition-all duration-300 flex items-center justify-center" aria-label="Previous">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button onClick={next} className="absolute right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-2xl hover:bg-white/20 hover:scale-110 transition-all duration-300 flex items-center justify-center" aria-label="Next">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </section>

      
      {/* Sections existantes */}
      <section id="service" ref={serviceRef}>
        <div className="bg-gradient-to-b from-gray-50 to-white">
          <NosService />
        </div>
      </section>

      <section id="testimony" ref={testimonyRef}>
        <div className="bg-gradient-to-b from-gray-50 to-white">
          <Testimonials />
        </div>
      </section>

      <section id="plans" ref={plansRef}>
        <div className="bg-gradient-to-b from-gray-50 to-white">
          <NosForfaits />
        </div>
      </section>


      <section id="contact" ref={contactRef}>
        <div className="bg-gradient-to-b from-gray-50 to-white">
          <Contact />
        </div>
      </section>

      

      {/* Footer */}
      <footer className="bg-gray-700 p-5">
        <div className="">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-[#FB9E3A] to-orange-400 rounded-xl flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-xl font-black text-white">Rapex group</span>
              </div>
              <p className="text-slate-400 text-sm">© 2025. Tous droits réservés</p>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a href="#" className="text-slate-400 hover:text-white transition-colors hover:underline">Politique de confidentialité</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors hover:underline">Conditions d'utilisation</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors hover:underline">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Publicacc;
