import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NosService from "../util/nosService";
import Testimonials from "../util/testimony";
import Contact from "../util/contact";
import ButtonConnexion from "../util/buttonconnexion";

const images = [
  "/images/music-7238254_1280.jpg",
  "/images/birthday.jpeg",
  "/images/little-girl-6746693_1280.jpg",
  "/images/play-5134828_1280.jpg",
  "/images/couple-443600_1280.jpg",
];

const Public_Accueil = () => {
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef(null);
  const touchStartX = useRef(0);
  const accueilRef = useRef(null);
  const serviceRef = useRef(null);
  const contactRef = useRef(null);
  const testimonyRef = useRef(null);

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

  return (
    <>
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
                
                <button className="group relative bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white px-10 py-4 rounded-full font-semibold text-lg shadow-2xl hover:shadow-orange-500/25 transform hover:-translate-y-2 transition-all duration-300 overflow-hidden min-w-[200px] cursor-pointer">
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                    </svg>
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
                  <div className="text-3xl font-bold text-white group-hover:text-orange-400 transition-colors duration-300">10K+</div>
                  <div className="text-white/70 text-sm font-medium">Événements créés</div>
                </div>
                <div className="text-center group">
                  <div className="text-3xl font-bold text-white group-hover:text-blue-400 transition-colors duration-300">50K+</div>
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

      <section id="testimony" ref={testimonyRef} > 
        <div className="bg-gradient-to-b from-gray-50 to-white">
          <Testimonials />
        </div>
      </section>

      <section id="contact" ref={contactRef}> 
        <div className="bg-gradient-to-b from-gray-50 to-white">
          <Contact />
        </div>
      </section>
    </>
  );
};

export default Public_Accueil;
